/**
 * AI 功能状态管理 Store
 *
 * 负责管理 AI 相关的状态和功能，包括：
 * - AI 模型预设配置管理
 * - 脑图生成表单状态
 * - AI 生枝功能的状态管理
 * - 与 AI API 的交互
 * - 预览数据的处理
 *
 * @class useAiStore
 * @example
 * const aiStore = useAiStore()
 * await aiStore.initialize()
 * aiStore.selectPreset('ollama-qwen2-7b-instruct')
 */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { GenerateMotePayload, GenerateMoteResponseData } from '@/services/aiApi'
import { aiApi } from '@/services/aiApi'
import { message } from 'ant-design-vue'
import { useDocStore } from '@/stores/docStore'
import type { MoteNode } from './moteStore'

/**
 * AI 提供商预设配置接口
 *
 * 定义 AI 模型的预设配置，包括 Ollama 和 OpenAI 兼容的模型。
 *
 * @interface ProviderPreset
 */
export interface ProviderPreset {
  /** 预设唯一标识符 */
  key: string
  /** 预设显示名称 */
  name: string
  /** 提供商类型 */
  type: 'ollama' | 'openai'
  /** 模型名称 */
  model: string
  /** API 基础 URL */
  baseUrl: string
}

export const useAiStore = defineStore('aiStore', () => {
  /**
   * AI 提供商预设配置列表
   *
   * 包含常用的 Ollama 和 OpenAI 兼容模型配置，
   * 用户可以直接选择使用，也可以手动配置。
   */
  const providerPresets: ProviderPreset[] = [
    {
      key: 'manual-ollama-custom',
      name: '本地(Ollama) - 手动配置',
      type: 'ollama',
      model: '',
      baseUrl: ''
    },
    {
      key: 'ollama-qwen2-7b-instruct',
      name: 'Ollama - Qwen2:7b-instruct',
      type: 'ollama',
      model: 'qwen2:7b-instruct',
      baseUrl: 'http://localhost:11434/v1'
    },
    {
      key: 'ollama-llama3-8b-instruct',
      name: 'Ollama - Llama3.1:8b-instruct',
      type: 'ollama',
      model: 'llama3.1:8b-instruct',
      baseUrl: 'http://localhost:11434/v1'
    },
    {
      key: 'ollama-mistral-7b-instruct',
      name: 'Ollama - Mistral:7b-instruct',
      type: 'ollama',
      model: 'mistral:7b-instruct',
      baseUrl: 'http://localhost:11434/v1'
    },
    {
      key: 'ollama-gemma3-4b',
      name: 'Ollama - Gemma3:4b',
      type: 'ollama',
      model: 'gemma3:4b',
      baseUrl: 'http://localhost:11434/v1'
    },
    {
      key: 'manual-openai-custom',
      name: '云端(OpenAI兼容) - 手动配置',
      type: 'openai',
      model: '',
      baseUrl: ''
    },
    {
      key: 'openai-gpt-4o-mini',
      name: 'OpenAI - GPT-4o-mini',
      type: 'openai',
      model: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1'
    },
    {
      key: 'openai-gpt-3-5-turbo',
      name: 'OpenAI - GPT-3.5-turbo',
      type: 'openai',
      model: 'gpt-3.5-turbo',
      baseUrl: 'https://api.openai.com/v1'
    },
    {
      key: 'deepseek-chat',
      name: 'OpenAI兼容 - DeepSeek V3',
      type: 'openai',
      model: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/v1'
    },
    {
      key: 'deepseek-reasoner',
      name: 'OpenAI兼容 - DeepSeek R1',
      type: 'openai',
      model: 'deepseek-reasoner',
      baseUrl: 'https://api.deepseek.com/v1'
    },
    {
      key: 'gemini-2-0-flash',
      name: 'OpenAI兼容 - Gemini 2.0 Flash',
      type: 'openai',
      model: 'gemini-2.0-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    },
    {
      key: 'gemini-2-0-flash-exp',
      name: 'OpenAI兼容 - Gemini 2.0 Flash Exp',
      type: 'openai',
      model: 'gemini-2.0-flash-exp',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    },
    {
      key: 'gemini-1-5-flash',
      name: 'OpenAI兼容 - Gemini 1.5 Flash',
      type: 'openai',
      model: 'gemini-1.5-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    },
  ]

  /** 默认表单配置 */
  const defaultForm: GenerateMotePayload = {
    inputType: 'theme',
    theme: '',
    text: '',
    docParentKey: '',
    provider: {
      type: 'ollama',
      model: '',
      baseUrl: '',
      apiKey: ''
    },
    options: { depthLimit: 4, branchingFactor: 4, language: 'zh' },
    create: false,
  }

  /** 脑图生成表单状态 */
  const form = reactive<GenerateMotePayload>({ ...defaultForm })

  /** 预览数据 */
  const preview = ref<GenerateMoteResponseData | null>(null)

  /** 标记是否已初始化 */
  const isInitialized = ref(false)

  /** AI 生枝状态 */
  const isAiExpanding = ref(false)

  /** AI 生枝弹窗是否打开 */
  const aiExpandModalOpen = ref(false)

  /** 选中的要生枝的节点ID */
  const selectedNodeForExpand = ref<string>('')

  /**
   * 初始化 AI Store
   *
   * 只在第一次调用时执行，确保文档树已加载，
   * 并设置默认的文档父节点。
   *
   * @returns {Promise<void>} 初始化完成
   *
   * @example
   * await aiStore.initialize()
   *
   * @throws {Error} 当文档树加载失败时
   */
  const initialize = async () => {
    if (isInitialized.value) return

    const docStore = useDocStore()
    if (!docStore.isInitialized && !docStore.isLoading) {
      await docStore.fetchDocTree()
    }

    if (docStore.docTree.key) {
      form.docParentKey = docStore.docTree.key
    }

    isInitialized.value = true
  }

  /**
   * 选择 AI 提供商预设
   *
   * 根据预设标识符设置表单中的提供商配置。
   *
   * @param {string} presetKey - 预设标识符
   *
   * @example
   * aiStore.selectPreset('ollama-qwen2-7b-instruct')
   */
  const selectPreset = (presetKey: string) => {
    const preset = providerPresets.find(p => p.key === presetKey)
    if (preset) {
      form.provider.type = preset.type
      form.provider.model = preset.model
      form.provider.baseUrl = preset.baseUrl
    }
  }

  /**
   * 重置表单到默认值
   *
   * 将所有表单字段恢复到初始状态。
   *
   * @example
   * aiStore.resetToDefaults()
   */
  const resetToDefaults = () => {
    Object.assign(form, defaultForm)
  }

  /**
   * 设置预览数据
   *
   * @param {GenerateMoteResponseData | null} data - 预览数据
   *
   * @example
   * aiStore.setPreview(responseData)
   */
  const setPreview = (data: GenerateMoteResponseData | null) => {
    preview.value = data
  }

  /**
   * 清除预览数据
   *
   * @example
   * aiStore.clearPreview()
   */
  const clearPreview = () => {
    preview.value = null
  }

  // ==================== AI生枝功能 ====================

  /**
   * 打开 AI 生枝配置弹窗
   *
   * 设置选中的节点ID并打开弹窗。
   *
   * @param {string} nodeId - 要生枝的节点ID
   *
   * @example
   * aiStore.openAiExpandModal('node123')
   */
  const openAiExpandModal = (nodeId: string) => {
    selectedNodeForExpand.value = nodeId
    aiExpandModalOpen.value = true
  }

  /**
   * 关闭 AI 生枝配置弹窗
   *
   * 关闭弹窗并清除选中的节点ID。
   *
   * @example
   * aiStore.closeAiExpandModal()
   */
  const closeAiExpandModal = () => {
    aiExpandModalOpen.value = false
    selectedNodeForExpand.value = ''
  }

  /**
   * AI 生枝方法
   *
   * 使用 AI 为指定节点生成子节点，包括：
   * - 调用 AI API 生成新节点
   * - 将生成的节点添加到脑图树中
   * - 显示成功消息和节点数量
   *
   * @param {string} nodeId - 要生枝的节点ID
   * @param {Object} provider - AI 提供商配置
   * @param {MoteNode} moteTree - 当前脑图树
   * @param {Function} findNodeText - 查找节点文本的函数
   * @param {Function} addExpandedNodeToTree - 添加节点到树的函数
   * @param {Object} [options] - 生枝选项
   * @param {number} [options.maxNewNodes] - 最大新节点数量
   * @param {number} [options.depth] - 生枝深度
   * @returns {Promise<void>} 生枝完成
   *
   * @example
   * await aiStore.aiExpandNode(
   *   'node123',
   *   { type: 'ollama', model: 'qwen2:7b-instruct', baseUrl: 'http://localhost:11434/v1' },
   *   moteTree,
   *   findNodeText,
   *   addExpandedNodeToTree,
   *   { maxNewNodes: 4, depth: 2 }
   * )
   *
   * @throws {Error} 当 AI API 调用失败时
   */
  const aiExpandNode = async (
    nodeId: string,
    provider: { type: 'openai' | 'ollama'; model: string; baseUrl: string; apiKey?: string },
    moteTree: MoteNode,
    findNodeText: (data: MoteNode, targetId: string) => string,
    addExpandedNodeToTree: (parentNodeId: string, expandedNode: MoteNode) => void,
    options?: {
      maxNewNodes?: number
      depth?: number
    }
  ) => {
    try {
      isAiExpanding.value = true

      const response = await aiApi.expandNode({
        moteTree: moteTree,
        selectedNodeId: nodeId,
        selectedNodeText: findNodeText(moteTree, nodeId),
        provider,
        options: {
          maxNewNodes: options?.maxNewNodes || 4,
          depth: options?.depth || 4,
          language: '中文'
        }
      })

      // 添加新节点到树中
      const expandedNode = response.data.data.expandedNode;
      addExpandedNodeToTree(nodeId, expandedNode);

      message.success(`成功生成 ${countNewNodes(expandedNode)} 个新节点`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      message.error('AI生枝失败: ' + errorMessage)
    } finally {
      isAiExpanding.value = false
    }
  }

  /**
   * 计算新节点数量
   *
   * 递归计算节点及其子节点的总数。
   *
   * @param {MoteNode} node - 要计算的节点
   * @returns {number} 节点总数
   *
   * @example
   * const count = aiStore.countNewNodes(expandedNode)
   * console.log(`生成了 ${count} 个新节点`)
   */
  const countNewNodes = (node: MoteNode): number => {
    let count = 0;
    if (node.children) {
      count += node.children.length;
      count += node.children.reduce((sum: number, child: MoteNode) => sum + countNewNodes(child), 0);
    }
    return count;
  };

  return {
    // AI生成相关
    form,
    preview,
    isInitialized,
    providerPresets,
    initialize,
    selectPreset,
    resetToDefaults,
    setPreview,
    clearPreview,

    // AI生枝相关
    isAiExpanding,
    aiExpandModalOpen,
    selectedNodeForExpand,
    openAiExpandModal,
    closeAiExpandModal,
    aiExpandNode,
  }
})
