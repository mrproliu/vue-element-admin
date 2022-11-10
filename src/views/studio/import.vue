<template>
  <div class="app-container">
    <el-form label-position="left" label-width="70px">
      <el-form-item label="影片导入">
        <el-upload v-if="couldUpload" :action="uploadActionUrl" :on-success="onUploadFileSuccess">
          <el-button size="large" type="primary">点击上传影片名称(.txt)</el-button>
        </el-upload>
        <div v-if="!couldUpload">{{ uploadFileName }}</div>
      </el-form-item>
      <el-form-item label="文件统计">
        <div>影片总计: {{ uploadStatics.count }} 个</div>
        <div>样例数据: {{ uploadStatics.first }} </div>
        <el-button v-if="showImportButton" size="large" :loading="importingStudios" type="primary" @click="importStudios">开始同步</el-button>
      </el-form-item>
      <el-form-item label="上传统计">
        <div>总计: {{ importStatics.totalCount }} 个</div>
        <div>添加影片: {{ importStatics.importedCount }} 个</div>
        <div>重复影片: {{ importStatics.duplicateCount }} 个</div>
        <div>上传错误: {{ importStatics.errorCount }} 个</div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { importStudios } from '@/api/studio'

export default {
  name: 'ArticleDetail',
  components: { },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      couldUpload: true,
      uploadFileName: '',
      uploadActionUrl: '/backend/studio/batchImportUplooad',
      showUploadStatics: false,
      uploadStatics: {
        batchId: '',
        count: 0,
        first: ['abc', 'dbs']
      },
      importStatics: {
        totalCount: 0,
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 0
      },
      showImportStatics: false,
      importingStudios: false,
      loading: false,
      showImportButton: false
    }
  },
  methods: {
    onUploadFileSuccess(resp) {
      this.couldUpload = false
      this.uploadFileName = resp.data.name
      this.showUploadStatics = true
      this.showImportButton = true
      this.uploadStatics.count = resp.data.count
      this.uploadStatics.first = resp.data.topTen
      this.uploadStatics.batchId = resp.data.batchId
    },
    importStudios() {
      if (!this.uploadStatics.batchId) {
        return
      }

      this.importingStudios = true
      var ref = this
      importStudios(this.uploadStatics.batchId).then((resp) => {
        ref.importingStudios = false
        ref.showImportStatics = true
        ref.importStatics = resp.data
        ref.showImportButton = false
        this.$notify({
          title: 'Success',
          message: '导入成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
