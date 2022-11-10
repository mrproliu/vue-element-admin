<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="求片名称" style="width: 200px; " class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="求片状态" clearable class="filter-item" style="width: 130px; margin-left: 10px">
        <el-option v-for="item in wantStatusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px" @click="handleFilter">
        检索
      </el-button>
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
          <span>{{ row.studioName }}</span>
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
          <template v-if="row.edit">
            <el-select v-model="row.status" class="filter-item" placeholder="Please select">
              <el-option v-for="item in studioStatusOptionsWithoutAll" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelUpdate(row)"
            >
              取消
            </el-button>
          </template>
          <span v-if="!row.edit">{{ statusName(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" sortable="custom">
        <template slot-scope="{row}">
          <span>{{ row.wantTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理时间">
        <template slot-scope="{row}">
          <span>{{ row.executeTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            :loading="updateStatusLoading"
            @click="updateRow(row)"
          >
            更新
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="prepareUpdate(row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, updateStatus } from '@/api/want'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const wantStatusOptions = [
  { key: 'NOT_EXECUTE', display_name: '未处理' },
  { key: 'EXECUTED', display_name: '已处理' },
  { key: '', display_name: '全部' }
]

const studioStatusOptionsWithAll = [
  { key: 'NOT_EXECUTE', display_name: '未处理' },
  { key: 'EXECUTED', display_name: '已处理' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const statusKeyValue = wantStatusOptions.reduce((acc, cur) => {
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
        status: 'NOT_EXECUTE',
        asc: true
      },
      wantStatusOptions: wantStatusOptions,
      studioStatusOptionsWithoutAll: studioStatusOptionsWithAll,
      currentRowStatus: '',
      updateStatusLoading: false,
      temp: {
        id: undefined,
        name: '',
        category: '',
        tmdb: '',
        status: ''
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
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
        response.data.items.forEach(s => { s.edit = false })
        this.list = response.data.items
        this.total = response.data.total

        this.listLoading = false
      })
    },
    prepareUpdate(row) {
      this.currentRowStatus = row.status
      row.edit = true
    },
    updateRow(row) {
      this.updateStatusLoading = true
      var ref = this
      updateStatus(row.id, row.status).then(response => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1, response.data)
        ref.updateStatusLoading = false
        row.edit = false
      })
    },
    cancelUpdate(row) {
      row.status = this.currentRowStatus
      row.edit = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
    handleUpdate(row) {
      row.edit = true
    },
    getSortClass: function(key) {
      const sort = this.listQuery.asc
      const field = this.listQuery.order
      return key === field ? (sort === true ? 'ascending' : 'descending') : ''
    }
  }
}
</script>
