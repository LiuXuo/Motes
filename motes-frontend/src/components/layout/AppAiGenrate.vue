<!--
  AI生成配置页面组件

  主要功能：
  - AI文档生成配置界面
  - 支持多种输入类型（主题、文本、文件）
  - AI模型配置和预设选择
  - 文件上传和预览
  - 表单验证和提交
  - 生成进度和结果展示
-->
<template>
  <div class="ai-generate-page">
    <h1 class="page-title">AI 生成配置</h1>
    <div class="panel">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="输入类型">
              <a-select v-model:value="form.inputType">
                <a-select-option value="theme">
                  <BulbOutlined style="margin-right: 8px;" />
                  主题
                </a-select-option>
                <a-select-option value="text">
                  <FileTextOutlined style="margin-right: 8px;" />
                  文本
                </a-select-option>
                <a-select-option value="file">
                  <UploadOutlined style="margin-right: 8px;" />
                  文件（PDF/DOCX/MD）
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="导入到" name="docParentKey">
              <a-input
                :value="selectedFolderName || form.docParentKey"
                placeholder="请选择目标文件夹"
                readonly
                @click="openPickFolder"
                style="cursor: pointer;"
              >
                <template #prefix>
                  <FolderOutlined style="margin-right: 8px;" />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item v-if="form.inputType==='theme'" label="主题" :required="form.inputType==='theme'" name="theme">
          <a-input v-model:value="form.theme" placeholder="请输入一个主题" allow-clear>
            <template #prefix>
              <BulbOutlined style="margin-right: 8px;" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item v-else-if="form.inputType==='text'" label="文本" :required="form.inputType==='text'" name="text">
          <div style="position: relative;">
            <FileTextOutlined style="position: absolute; left: 12px; top: 12px; z-index: 1;" />
            <a-textarea
              v-model:value="form.text"
              :rows="6"
              placeholder="粘贴或输入文本"
              style="padding: 7px 11px 7px 36px;"
            />
          </div>
        </a-form-item>
        <a-form-item v-else label="文档文件" :required="form.inputType==='file'" name="file">
          <a-upload
            :before-upload="handleBeforeUpload"
            :maxCount="1"
            :showUploadList="true"
            :accept="'.pdf,.doc,.docx,.md'"
            :file-list="fileList"
            @remove="handleRemoveFile"
          >
            <a-button>
              <template #icon>
                <UploadOutlined />
              </template>
              选择文件（PDF/DOCX/MD）
            </a-button>
          </a-upload>
        </a-form-item>

        <a-divider>模型配置</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="预设">
              <a-select
                v-model:value="selectedPresetKey"
                placeholder="选择预设或手动配置"
                @change="handlePresetChange"
              >
                <a-select-option
                  v-for="preset in aiStore.providerPresets"
                  :key="preset.key"
                  :value="preset.key"
                >
                  <DesktopOutlined v-if="preset.type === 'ollama'" style="margin-right: 8px;" />
                  <CloudOutlined v-else style="margin-right: 8px;" />
                  {{ preset.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="模型" :required="true" name="provider.model" :validate-trigger="['onSubmit']">
              <a-input v-model:value="form.provider.model" placeholder="如 gpt-4o-mini 或 qwen2:7b-instruct" allow-clear>
                <template #prefix>
                  <RobotOutlined style="margin-right: 8px;" />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Base URL" :required="true" name="provider.baseUrl" :validate-trigger="['onSubmit']">
              <a-input v-model:value="form.provider.baseUrl" placeholder="请输入 Base URL" allow-clear>
                <template #prefix>
                  <GlobalOutlined style="margin-right: 8px;" />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="温度">
              <a-input-number v-model:value="form.provider.temperature" :min="0" :max="2" :step="0.1" placeholder="控制随机性，越高越发散（0-2）" style="width: 100%">
                <template #prefix>
                  <FireOutlined style="margin-right: 8px;" />
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Top P">
              <a-input-number v-model:value="form.provider.top_p" :min="0" :max="1" :step="0.05" placeholder="核采样阈值，越小越保守（0-1）" style="width: 100%">
                <template #prefix>
                  <PercentageOutlined style="margin-right: 8px;" />
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="API Key" :required="form.provider.type === 'openai'" name="provider.apiKey" v-if="form.provider.type === 'openai'">
              <a-input-password v-model:value="form.provider.apiKey" placeholder="不保存，仅本次使用" allow-clear>
                <template #prefix>
                  <KeyOutlined style="margin-right: 8px;" />
                </template>
              </a-input-password>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider>生成约束</a-divider>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="最大层级">
              <a-input-number v-model:value="form.options.depthLimit" :min="1" :max="16" style="width: 100%">
                <template #prefix>
                  <SettingOutlined style="margin-right: 8px;" />
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="每层最大分支数">
              <a-input-number v-model:value="form.options.branchingFactor" :min="1" :max="16" style="width: 100%">
                <template #prefix>
                  <BranchesOutlined style="margin-right: 8px;" />
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="输出语言">
              <a-select v-model:value="form.options.language">
                <template #suffixIcon>
                  <TranslationOutlined />
                </template>
                <a-select-option value="zh">中文</a-select-option>
                <a-select-option value="en">English</a-select-option>
              </a-select>
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
import { ref, onMounted, computed, nextTick } from 'vue'
import {
  FolderOutlined,
  BulbOutlined,
  FileTextOutlined,
  UploadOutlined,
  RobotOutlined,
  GlobalOutlined,
  KeyOutlined,
  SettingOutlined,
  BranchesOutlined,
  TranslationOutlined,
  DesktopOutlined,
  CloudOutlined,
  FireOutlined,
  PercentageOutlined
} from '@ant-design/icons-vue'
import aiApi, { type GenerateMoteResponseData } from '@/services/aiApi'
import { importMoteDataJson } from '@/services/moteApi'
import { message, type FormInstance } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import { useAiStore } from '@/stores/aiStore'
import { storeToRefs } from 'pinia'
import { useDocStore } from '@/stores/docStore'
import DocTreeModal from './DocTreeModal.vue'
import type { DocNode } from '@/stores/docStore'

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const errorDetails = ref<string | null>(null)
const errorCode = ref<string | null>(null)
const aiStore = useAiStore()
const form = aiStore.form
const { preview } = storeToRefs(aiStore)
const docStore = useDocStore()
const fileList = ref<UploadFile[]>([])
let selectedFile: File | null = null
const pickFolderOpen = ref(false)
const selectedPresetKey = ref<string>('')
const formRef = ref<FormInstance>()

// 根据key查找文件夹名称的计算属性
const selectedFolderName = computed(() => {
  if (!form.docParentKey) return ''

  // 如果是根节点，直接返回根节点名称
  if (form.docParentKey === docStore.docTree.key) {
    return docStore.docTree.title || '我的文档'
  }

  const findNodeName = (nodes: DocNode[]): string => {
    for (const node of nodes) {
      if (node.key === form.docParentKey) {
        return node.title
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeName(node.children)
        if (found) return found
      }
    }
    return ''
  }

  return findNodeName(docStore.docTree.children || [])
})

const openPickFolder = () => {
  pickFolderOpen.value = true
}

const handlePickFolderConfirm = (folderKey: string) => {
  aiStore.form.docParentKey = folderKey
}

// 处理预设选择
const handlePresetChange = (presetKey: string) => {
  selectedPresetKey.value = presetKey
  aiStore.selectPreset(presetKey)
  // 清除表单验证错误
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

onMounted(async () => {
  // 使用仓库的初始化方法，只在第一次调用时获取根节点key
  await aiStore.initialize()

  // 设置默认预设选择
  const defaultPreset = aiStore.providerPresets.find(preset =>
    preset.type === form.provider.type &&
    preset.model === form.provider.model &&
    preset.baseUrl === form.provider.baseUrl
  )
  if (defaultPreset) {
    selectedPresetKey.value = defaultPreset.key
  }

  // 清除表单验证错误，清除默认的错误提示
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
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

// 表单验证函数
const validateForm = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // 验证目标文件夹
  if (!form.docParentKey?.trim()) {
    errors.push('请选择目标文件夹')
  }

  // 验证模型名称
  if (!form.provider.model?.trim()) {
    errors.push('请输入模型名称')
  }

  // 验证 Base URL
  if (!form.provider.baseUrl?.trim()) {
    errors.push('请输入 Base URL')
  }

  // 当类型为云端时，验证 API Key
  if (form.provider.type === 'openai' && !form.provider.apiKey?.trim()) {
    errors.push('请输入 API Key')
  }

  // 根据输入类型验证对应字段
  if (form.inputType === 'theme') {
    if (!form.theme?.trim()) {
      errors.push('请输入主题')
    }
  } else if (form.inputType === 'text') {
    if (!form.text?.trim()) {
      errors.push('请输入文本内容')
    }
  } else if (form.inputType === 'file') {
    if (!selectedFile) {
      errors.push('请选择文件')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

const handleGenerate = async () => {
  if (loading.value) return

  // 表单验证
  const validation = validateForm()
  if (!validation.isValid) {
    message.error(validation.errors.join('、'))
    return
  }

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
