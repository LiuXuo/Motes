<template>
  <div class="ai-generate-page">
    <h1 class="page-title">AI 生成脑图笔记</h1>
    <div class="panel">
      <a-form :model="form" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="输入类型">
              <a-select v-model:value="form.inputType">
                <a-select-option value="theme">主题</a-select-option>
                <a-select-option value="text">文本</a-select-option>
                <a-select-option value="file">文件（PDF/DOCX/MD）</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="存放至">
              <div style="display:flex; gap:8px; align-items:center;">
                <a-input v-model:value="form.docParentKey" placeholder="请选择或输入目标文件夹 key" />
                <a-button @click="openPickFolder">选择</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item v-if="form.inputType==='theme'" label="主题" :required="form.inputType==='theme'">
          <a-input v-model:value="form.theme" placeholder="请输入一个主题" />
        </a-form-item>
        <a-form-item v-else-if="form.inputType==='text'" label="文本" :required="form.inputType==='text'">
          <a-textarea v-model:value="form.text" :rows="6" placeholder="粘贴或输入文本" />
        </a-form-item>
        <a-form-item v-else label="文档文件" :required="form.inputType==='file'">
          <a-upload
            :before-upload="handleBeforeUpload"
            :maxCount="1"
            :showUploadList="true"
            :accept="'.pdf,.doc,.docx,.md'"
            :file-list="fileList"
            @remove="handleRemoveFile"
          >
            <a-button>选择文件（PDF/DOCX/MD）</a-button>
          </a-upload>
        </a-form-item>

        <a-divider>Provider</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="类型">
              <a-select v-model:value="form.provider.type">
                <a-select-option value="ollama">本地（Ollama）</a-select-option>
                <a-select-option value="openai">云端（OpenAI 兼容）</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="模型" :required="true">
              <a-input v-model:value="form.provider.model" placeholder="如 gpt-4o-mini 或 gemma3:4b" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Base URL">
              <a-input v-model:value="form.provider.baseUrl" placeholder="可选，覆盖默认端点" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="温度">
              <a-input-number v-model:value="form.provider.temperature" :min="0" :max="2" :step="0.1" placeholder="控制随机性，越高越发散（0-2）" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Top P">
              <a-input-number v-model:value="form.provider.top_p" :min="0" :max="1" :step="0.05" placeholder="核采样阈值，越小越保守（0-1）" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="API Key">
              <a-input-password v-model:value="form.provider.apiKey" placeholder="不保存，仅本次使用" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider>生成约束</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="最大层级">
              <a-input-number v-model:value="form.options.depthLimit" :min="1" :max="6" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="每层最大分支数">
              <a-input-number v-model:value="form.options.branchingFactor" :min="1" :max="12" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="输出语言">
              <a-select v-model:value="form.options.language">
                <a-select-option value="zh">中文</a-select-option>
                <a-select-option value="en">English</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="调试模式">
              <a-switch v-model:checked="form.debug" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-alert v-if="errorMsg" type="error" :message="errorMsg" :description="errorDetails" show-icon />

        <div class="actions">
          <a-button :disabled="!preview" @click="handleImport">导入创建</a-button>
          <a-button class="primary-btn" type="primary" :loading="loading" @click="handleGenerate">生成预览</a-button>
        </div>
      </a-form>

      <a-divider v-if="preview">预览</a-divider>
      <pre v-if="preview" class="preview">{{ JSON.stringify(preview, null, 2) }}</pre>
      <a-divider v-if="preview?.rawContent">模型原文</a-divider>
      <pre v-if="preview?.rawContent" class="preview raw">{{ preview?.rawContent }}</pre>
    </div>
    <!-- 选择目标文件夹弹窗 -->
    <DocTreeModal
      v-model:open="pickFolderOpen"
      title="选择存放文件夹"
      okText="选择此处"
      :confirmLoading="loading"
      @confirm="handlePickFolderConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import aiApi, { type GenerateMoteResponseData } from '@/services/aiApi'
import { importMoteDataJson } from '@/services/moteApi'
import { message } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import { useAiGenerateStore } from '@/stores/aiGenerateStore'
import { storeToRefs } from 'pinia'
import { useDocStore } from '@/stores/docStore'
import DocTreeModal from './DocTreeModal.vue'

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const errorDetails = ref<string | null>(null)
const errorCode = ref<string | null>(null)
const aiStore = useAiGenerateStore()
const form = aiStore.form
const { preview } = storeToRefs(aiStore)
const docStore = useDocStore()
const fileList = ref<UploadFile[]>([])
let selectedFile: File | null = null
const pickFolderOpen = ref(false)

const openPickFolder = () => {
  pickFolderOpen.value = true
}

const handlePickFolderConfirm = (folderKey: string) => {
  aiStore.form.docParentKey = folderKey
}

onMounted(async () => {
  // 默认 docParentKey 使用文档树根节点
  if (!docStore.isInitialized && !docStore.isLoading) {
    await docStore.fetchDocTree()
  }
  if (docStore.docTree.key) {
    aiStore.form.docParentKey = docStore.docTree.key
  }
})

// 表单默认值与预览由 Pinia 仓库存放

const handleBeforeUpload = (file: File) => {
  selectedFile = file
  fileList.value = [{ uid: Date.now().toString(), name: file.name, status: 'done' }]
  return false // 阻止自动上传
}

const handleRemoveFile = () => {
  selectedFile = null
  fileList.value = []
}

const handleGenerate = async () => {
  if (loading.value) return
  errorMsg.value = null
  errorDetails.value = null
  errorCode.value = null
  aiStore.clearPreview()
  loading.value = true
  try {
    // 文件模式：走 form-data 接口
    type ApiResponse = { success?: boolean; data?: GenerateMoteResponseData }
    let data: ApiResponse | undefined
    if (form.inputType === 'file') {
      if (!selectedFile) {
        throw new Error('请先选择文件')
      }
      const fd = new FormData()
      fd.append('document', selectedFile)
      fd.append('docParentKey', form.docParentKey)
      if (form.title) fd.append('title', form.title)
      fd.append('provider', JSON.stringify(form.provider))
      fd.append('options', JSON.stringify(form.options || {}))
      fd.append('create', String(!!form.create))
      fd.append('debug', String(!!form.debug))

      const resp = await aiApi.generateMoteFromFile(fd)
      data = resp.data
    } else {
      const resp = await aiApi.generateMote(form)
      data = resp.data
    }
    const payload = data?.data
    aiStore.setPreview(payload ?? null)
  } catch (errUnknown) {
    const err = errUnknown as { response?: { data?: { error?: { code?: string; message?: string; details?: string } } }; message?: string }
    errorMsg.value = err?.response?.data?.error?.message || err?.message || '生成失败'
    errorDetails.value = err?.response?.data?.error?.details || null
    errorCode.value = err?.response?.data?.error?.code || null
  } finally {
    loading.value = false
  }
}

const handleImport = async () => {
  if (!preview.value) return
  try {
    const resp = await importMoteDataJson(preview.value.docParentKey, preview.value.moteTree, preview.value.title)
    if (resp?.success) {
      message.success('导入成功')
      aiStore.clearPreview()
      await docStore.fetchDocTree()
    } else {
      message.error(resp?.error?.message || '导入失败')
    }
  } catch {
    message.error('导入失败')
  }
}

</script>

<style scoped lang="less">
.ai-generate-page {
  padding: 50px;
  height: 100%;
  overflow-y: auto;
  /* 隐藏滚动条（仍可滚动） */
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none;    /* Firefox */
  &::-webkit-scrollbar {    /* Chrome/Safari */
    width: 0;
    height: 0;
  }

  .page-title {
    font-size: 34px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 32px;
    margin-left: 8px;
  }

  .panel {
    display: block;
    background: #fff;
    border-radius: 8px;
    padding: 50px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

    .actions {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .primary-btn {
        /* 去掉圆角、字体颜色、高度和 padding 的覆盖，仅保留色值与 hover */
        background-color: rgba(0, 0, 0, 0.66) !important;
        border: none !important;

        &:hover {
          background-color: rgba(0, 0, 0, 0.88) !important;
        }
      }
    }

    .preview {
      background: #0b1020;
      color: #d9f7be;
      padding: 12px;
      border-radius: 6px;
      margin: 0; /* 去掉上下默认 margin */
      font-family: Consolas, 'Courier New', monospace;
      max-height: 480px;
      overflow: auto;
      /* 预览代码块隐藏滚动条 */
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  }

  /* 与 Ant Design 的通用覆写已移至全局样式 */
}
</style>
