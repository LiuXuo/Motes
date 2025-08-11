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
 */
export type ProviderConfig = {
  type: 'openai' | 'ollama'
  baseUrl?: string
  apiKey?: string
  model: string
  temperature?: number
  top_p?: number
}

/**
 * 生成脑图的请求载荷
 * - inputType: 主题/文本/Markdown 三选一
 * - options.language: 'zh' | 'en'（语言偏好）
 * - provider: 指定模型与端点（本地优先 Ollama）
 * - debug: 返回原始模型文本 rawContent，便于排查
 */
export type GenerateMotePayload = {
  inputType: 'theme' | 'text' | 'markdown' | 'file'
  theme?: string
  text?: string
  markdownContent?: string
  docParentKey: string
  title?: string
  options: { depthLimit?: number; branchingFactor?: number; language?: string; maxTokens?: number }
  provider: ProviderConfig
  create?: boolean
  debug?: boolean
}

/**
 * 前端使用的标准脑图节点结构（与后端一致）
 */
export type MoteNode = {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

/**
 * 生成响应数据（已规范化）
 */
export type GenerateMoteResponseData = {
  title: string
  moteTree: MoteNode
  docParentKey: string
  created: boolean
  rawContent?: string
  fallbackUsed?: boolean
}

export const aiApi = {
  /**
   * 请求后端生成标准脑图结构
   * @param payload 生成请求载荷
   * @param opts.signal 可选的 AbortSignal；用于在长任务中主动取消请求
   * @returns AxiosPromise
   * 备注：超时为 300000ms（5 分钟），适配本地大模型推理时长
   */
  generateMote(payload: GenerateMotePayload, opts?: { signal?: AbortSignal }) {
    return api.post('/ai/generate-mote', payload, { timeout: 300000, signal: opts?.signal })
  },

  /**
   * 基于上传文件生成脑图
   * formData 字段：
   * - document: File
   * - docParentKey: string
   * - title?: string
   * - provider: string(JSON)
   * - options: string(JSON)
   * - create?: 'true'|'false'
   * - debug?: 'true'|'false'
   */
  generateMoteFromFile(form: FormData, opts?: { signal?: AbortSignal }) {
    return api.post('/ai/generate-mote-file', form, {
      timeout: 300000,
      signal: opts?.signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default aiApi


