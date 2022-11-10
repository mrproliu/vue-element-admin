<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="影片名称" style="width: 200px; " class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="影片状态" clearable class="filter-item" style="width: 130px; margin-left: 10px">
        <el-option v-for="item in studioStatusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px" @click="handleFilter">
        检索
      </el-button>
      <!--<el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">-->
      <!--  增加影片-->
      <!--</el-button>-->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TMDB" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tmdb }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="{row}">
          <span>{{ statusName(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" sortable="custom">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间">
        <template slot-scope="{row}">
          <span>{{ row.lastUpdateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <!--<el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">-->
          <!--  Publish-->
          <!--</el-button>-->
          <!--<el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">-->
          <!--  Draft-->
          <!--</el-button>-->
          <!--<el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">-->
          <!--  Delete-->
          <!--</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-input v-model="temp.category" />
        </el-form-item>
        <el-form-item label="TMDB" prop="tmdb">
          <el-input v-model="temp.tmdb" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in studioStatusOptionsWithoutAll" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateStudio } from '@/api/studio'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const studioStatusOptions = [
  { key: '', display_name: '全部' },
  { key: 'NOT_UPLOAD', display_name: '未上传' },
  { key: 'UPLOADED', display_name: '已上传' }
]

const studioStatusOptionsWithAll = [
  { key: 'NOT_UPLOAD', display_name: '未上传' },
  { key: 'UPLOADED', display_name: '已上传' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const statusKeyValue = studioStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: '',
        status: undefined,
        asc: true
      },
      studioStatusOptions: studioStatusOptions,
      studioStatusOptionsWithoutAll: studioStatusOptionsWithAll,
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        name: '',
        category: '',
        tmdb: '',
        status: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '更新影片',
        create: '创建影片'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    statusName(enumValue) {
      return statusKeyValue[enumValue]
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.asc = true
      } else {
        this.listQuery.asc = false
      }
      this.listQuery.order = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateStudio(tempData).then((resp) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, resp.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // handleDelete(row, index) {
    //   this.$notify({
    //     title: 'Success',
    //     message: 'Delete Successfully',
    //     type: 'success',
    //     duration: 2000
    //   })
    //   this.list.splice(index, 1)
    // },
    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
    //     const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
    //     const data = this.formatJson(filterVal)
    //     excel.export_json_to_excel({
    //       header: tHeader,
    //       data,
    //       filename: 'table-list'
    //     })
    //     this.downloadLoading = false
    //   })
    // },
    // formatJson(filterVal) {
    //   return this.list.map(v => filterVal.map(j => {
    //     if (j === 'timestamp') {
    //       return parseTime(v[j])
    //     } else {
    //       return v[j]
    //     }
    //   }))
    // },
    getSortClass: function(key) {
      const sort = this.listQuery.asc
      const field = this.listQuery.order
      return key === field ? (sort === true ? 'ascending' : 'descending') : ''
    }
  }
}
</script>
