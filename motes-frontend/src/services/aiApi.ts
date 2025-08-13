/**
 * AI 生成 API 服务
 *
 * 封装与后端 AI 生成相关的 API 调用，包括：
 * - 脑图自动生成（基于主题、文本、Markdown、文件）
 * - AI 节点扩展功能
 * - 支持多种 AI 提供商（OpenAI、Ollama）
 * - 长任务处理和取消机制
 *
 * 统一走后端 `/api/ai/generate-mote` 接口，后端完成 Provider 调用、
 * JSON 解析与结构校验，前端仅负责透传参数、接收标准化后的数据。
 *
 * @class AiApiService
 */
import { api } from './index'

/**
 * AI 生成接口封装
 *
 * 说明：
 * - 统一走后端 `/api/ai/generate-mote`，后端完成 Provider 调用、JSON 解析与结构校验
 * - 前端仅负责透传参数、接收标准化后的 { title, moteTree }
 * - 超时较长（默认 5 分钟）以适配本地大模型；可通过 AbortController 主动取消
 */

/**
 * Provider 基本配置（OpenAI 兼容协议 / Ollama）
 *
 * 定义 AI 服务提供商的基本配置参数，支持 OpenAI 兼容协议和本地 Ollama。
 *
 * @interface ProviderConfig
 */
export type ProviderConfig = {
  /** AI 提供商类型 */
  type: 'openai' | 'ollama'
  /** API 基础地址（可选，Ollama 默认为本地地址） */
  baseUrl?: string
  /** API 密钥（OpenAI 必需，Ollama 可选） */
  apiKey?: string
  /** 模型名称 */
  model: string
  /** 温度参数，控制生成随机性（0-1） */
  temperature?: number
  /** Top-p 参数，控制生成多样性（0-1） */
  top_p?: number
}

/**
 * 生成脑图的请求载荷
 *
 * 定义生成脑图请求的完整参数结构，支持多种输入类型和配置选项。
 *
 * @interface GenerateMotePayload
 */
export type GenerateMotePayload = {
  /** 输入类型：主题/文本/文件 三选一 */
  inputType: 'theme' | 'text' | 'file'
  /** 主题内容（当 inputType 为 'theme' 时使用） */
  theme?: string
  /** 文本内容（当 inputType 为 'text' 时使用） */
  text?: string
  /** 文档父节点标识 */
  docParentKey: string
  /** 生成的脑图标题（可选） */
  title?: string
  /** 生成选项配置 */
  options: {
    /** 深度限制 */
    depthLimit?: number
    /** 分支因子 */
    branchingFactor?: number
    /** 语言偏好：'zh' | 'en' */
    language?: string
    /** 最大 token 数 */
    maxTokens?: number
  }
  /** AI 提供商配置 */
  provider: ProviderConfig
  /** 是否立即创建文档 */
  create?: boolean
}

/**
 * AI 节点扩展请求载荷
 *
 * 定义扩展指定节点的请求参数，用于在现有脑图中添加新分支。
 *
 * @interface ExpandNodePayload
 */
export type ExpandNodePayload = {
  /** 当前脑图树数据 */
  moteTree: MoteNode
  /** 要扩展的节点ID */
  selectedNodeId: string
  /** 要扩展的节点文本 */
  selectedNodeText: string
  /** AI 提供商配置 */
  provider: ProviderConfig
  /** 扩展选项 */
  options: {
    /** 最大新节点数 */
    maxNewNodes: number
    /** 扩展深度 */
    depth: number
    /** 生成语言 */
    language: string
  }
}

/**
 * AI 节点扩展响应数据
 *
 * 定义节点扩展操作的返回结果。
 *
 * @interface ExpandNodeResponse
 */
export type ExpandNodeResponse = {
  /** 扩展后的节点数据 */
  expandedNode: {
    /** 节点文本 */
    text: string
    /** 子节点数组 */
    children?: Array<{
      /** 子节点文本 */
      text: string
      /** 孙节点数组 */
      children?: MoteNode[]
    }>
  }
  /** 是否使用了降级方案 */
  fallbackUsed?: boolean
}

/**
 * 前端使用的标准脑图节点结构（与后端一致）
 *
 * 定义脑图树中每个节点的数据结构，支持层级关系和折叠状态。
 *
 * @interface MoteNode
 */
export type MoteNode = {
  /** 节点唯一标识符 */
  id: string
  /** 节点文本内容 */
  text: string
  /** 节点是否折叠（隐藏子节点） */
  collapsed: boolean
  /** 父节点ID，根节点为空字符串 */
  parentId: string
  /** 子节点数组，可选 */
  children?: MoteNode[]
}

/**
 * 生成响应数据（已规范化）
 *
 * 定义 AI 生成脑图的标准化响应格式。
 *
 * @interface GenerateMoteResponseData
 */
export type GenerateMoteResponseData = {
  /** 生成的脑图标题 */
  title: string
  /** 生成的脑图树结构 */
  moteTree: MoteNode
  /** 文档父节点标识 */
  docParentKey: string
  /** 是否已创建文档 */
  created: boolean
  /** 是否使用了降级方案 */
  fallbackUsed?: boolean
}

/**
 * AI API 服务对象
 *
 * 提供完整的 AI 生成功能接口，包括脑图生成、文件处理和节点扩展。
 *
 * @constant {Object} aiApi - AI API 服务对象
 */
export const aiApi = {
  /**
   * 请求后端生成标准脑图结构
   *
   * 根据输入内容（主题、文本、Markdown）自动生成脑图结构。
   * 支持多种 AI 提供商和生成参数配置。
   *
   * @param {GenerateMotePayload} payload - 生成请求载荷
   * @param {Object} [opts] - 请求选项
   * @param {AbortSignal} [opts.signal] - 可选的 AbortSignal，用于在长任务中主动取消请求
   * @returns {Promise<AxiosResponse>} 生成响应
   *
   * @example
   * const response = await aiApi.generateMote({
   *   inputType: 'theme',
   *   theme: '人工智能的发展历程',
   *   docParentKey: 'parent123',
   *   provider: { type: 'openai', model: 'gpt-3.5-turbo' },
   *   options: { language: 'zh', depthLimit: 3 }
   * })
   *
   * @throws {400} 当请求参数格式错误时
   * @throws {401} 当用户未登录时
   * @throws {500} 当 AI 服务错误时
   *
   * 备注：超时为 300000ms（5 分钟），适配本地大模型推理时长
   */
  generateMote(payload: GenerateMotePayload, opts?: { signal?: AbortSignal }) {
    return api.post('/ai/generate-mote', payload, { timeout: 300000, signal: opts?.signal })
  },

  /**
   * 基于上传文件生成脑图
   *
   * 从上传的文档文件（PDF、Word、Markdown 等）自动生成脑图结构。
   * 系统会解析文档内容并提取关键信息构建脑图。
   *
   * @param {FormData} form - 表单数据
   * @param {Object} [opts] - 请求选项
   * @param {AbortSignal} [opts.signal] - 可选的 AbortSignal，用于取消请求
   * @returns {Promise<AxiosResponse>} 生成响应
   *
   * @example
   * const formData = new FormData()
   * formData.append('document', file)
   * formData.append('docParentKey', 'parent123')
   * formData.append('title', '从文档生成的脑图')
   * formData.append('provider', JSON.stringify({ type: 'openai', model: 'gpt-4' }))
   * formData.append('options', JSON.stringify({ language: 'zh' }))
   *
   * const response = await aiApi.generateMoteFromFile(formData)
   *
   * formData 字段：
   * - document: File - 上传的文档文件
   * - docParentKey: string - 文档父节点标识
   * - title?: string - 生成的脑图标题
   * - provider: string(JSON) - AI 提供商配置
   * - options: string(JSON) - 生成选项
   * - create?: 'true'|'false' - 是否立即创建文档
   *
   * @throws {400} 当文件格式不支持时
   * @throws {401} 当用户未登录时
   * @throws {413} 当文件过大时
   * @throws {500} 当 AI 服务错误时
   */
  generateMoteFromFile(form: FormData, opts?: { signal?: AbortSignal }) {
    return api.post('/ai/generate-mote-file', form, {
      timeout: 300000,
      signal: opts?.signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * AI 节点扩展接口
   *
   * 在现有脑图的指定节点下自动生成新的分支节点。
   * 基于选中节点的内容，AI 会生成相关的子节点。
   *
   * @param {ExpandNodePayload} payload - 扩展请求载荷
   * @param {Object} [opts] - 请求选项
   * @param {AbortSignal} [opts.signal] - 可选的 AbortSignal，用于取消请求
   * @returns {Promise<AxiosResponse>} 扩展响应
   *
   * @example
   * const response = await aiApi.expandNode({
   *   moteTree: currentMoteTree,
   *   selectedNodeId: 'node123',
   *   selectedNodeText: '人工智能',
   *   provider: { type: 'openai', model: 'gpt-3.5-turbo' },
   *   options: { maxNewNodes: 5, depth: 2, language: 'zh' }
   * })
   *
   * @throws {400} 当请求参数格式错误时
   * @throws {401} 当用户未登录时
   * @throws {404} 当节点不存在时
   * @throws {500} 当 AI 服务错误时
   */
  expandNode(payload: ExpandNodePayload, opts?: { signal?: AbortSignal }) {
    return api.post('/ai/expand-node', payload, {
      timeout: 300000,
      signal: opts?.signal
    });
  },
}

export default aiApi


