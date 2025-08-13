/**
 * 脑图笔记 API 服务
 *
 * 封装与后端脑图笔记相关的 API 调用，包括：
 * - 脑图数据的获取和更新
 * - 脑图导入导出功能
 * - 支持多种格式（JSON、Markdown）
 * - 脑图树结构管理
 *
 * 提供完整的脑图笔记数据操作接口，支持本地和远程数据同步。
 *
 * @class MoteApiService
 */
import api from './api'

// ==================== 脑图笔记API ====================

/**
 * 获取脑图笔记数据
 *
 * 根据文档标识从后端获取完整的脑图树结构数据。
 * 返回的数据包含所有节点信息和层级关系。
 *
 * @param {string} docKey - 文档唯一标识
 * @returns {Promise<ApiResponse>} 脑图笔记数据响应
 *
 * @example
 * const response = await getMoteData('doc123')
 * if (response.success) {
 *   moteStore.setMoteTree(response.data.moteTree)
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当文档不存在时
 * @throws {500} 当服务器错误时
 */
export const getMoteData = async (docKey: string) => {
  const response = await api.get(`/mote/${docKey}`)
  return response.data
}

/**
 * 更新脑图笔记数据
 *
 * 将当前脑图树数据保存到后端，支持自动保存和手动保存。
 * 更新前会检查数据完整性，确保脑图结构有效。
 *
 * @param {string} docKey - 文档唯一标识
 * @param {unknown} moteTree - 脑图树数据
 * @returns {Promise<ApiResponse>} 更新结果响应
 *
 * @example
 * const response = await updateMoteData('doc123', moteTree)
 * if (response.success) {
 *   message.success('保存成功')
 * }
 *
 * @throws {400} 当脑图数据格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当文档不存在时
 * @throws {500} 当服务器错误时
 */
export const updateMoteData = async (docKey: string, moteTree: unknown) => {
  const response = await api.put(`/mote/${docKey}`, { moteTree })
  return response.data
}

/**
 * 导出脑图笔记
 *
 * 将脑图笔记导出为指定格式，支持 JSON 和 Markdown 两种格式。
 * JSON 格式保持完整的树结构，Markdown 格式便于阅读和分享。
 *
 * @param {string} docKey - 文档唯一标识
 * @param {'json' | 'markdown'} [format='json'] - 导出格式
 * @returns {Promise<ApiResponse>} 导出数据响应
 *
 * @example
 * // 导出为 JSON 格式
 * const jsonResponse = await exportMoteData('doc123', 'json')
 *
 * // 导出为 Markdown 格式
 * const mdResponse = await exportMoteData('doc123', 'markdown')
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当文档不存在时
 * @throws {500} 当服务器错误时
 */
export const exportMoteData = async (docKey: string, format: 'json' | 'markdown' = 'json') => {
  const response = await api.get(`/mote/${docKey}/export?format=${format}`)
  return response.data
}

/**
 * 导入脑图笔记 - JSON格式
 *
 * 从 JSON 格式的脑图数据创建新的脑图笔记。
 * 导入的脑图会保持原有的树结构和节点关系。
 *
 * @param {string} parentKey - 父节点唯一标识
 * @param {unknown} moteTree - 脑图树数据
 * @param {string} [title='导入的笔记'] - 脑图标题
 * @returns {Promise<ApiResponse>} 导入结果响应
 *
 * @example
 * const response = await importMoteDataJson('parent123', moteTreeData, '我的笔记')
 * if (response.success) {
 *   message.success('导入成功')
 * }
 *
 * @throws {400} 当脑图数据格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当父节点不存在时
 * @throws {500} 当服务器错误时
 */
export const importMoteDataJson = async (parentKey: string, moteTree: unknown, title: string = '导入的笔记') => {
  const response = await api.post('/mote/import', {
    parentKey,
    moteTree,
    title,
    format: 'json'
  })
  return response.data
}

/**
 * 导入脑图笔记 - Markdown格式
 *
 * 从 Markdown 内容自动生成脑图结构。
 * 系统会解析 Markdown 的标题层级，自动构建树形结构。
 *
 * @param {string} parentKey - 父节点唯一标识
 * @param {string} markdownContent - Markdown 内容
 * @param {string} [title='导入的笔记'] - 脑图标题
 * @returns {Promise<ApiResponse>} 导入结果响应
 *
 * @example
 * const markdown = `# 标题1\n## 子标题1\n### 子子标题1\n## 子标题2`
 * const response = await importMoteDataMarkdown('parent123', markdown, '从Markdown导入')
 *
 * @throws {400} 当 Markdown 格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当父节点不存在时
 * @throws {500} 当服务器错误时
 */
export const importMoteDataMarkdown = async (parentKey: string, markdownContent: string, title: string = '导入的笔记') => {
  const response = await api.post('/mote/import', {
    parentKey,
    markdownContent,
    title,
    format: 'markdown'
  })
  return response.data
}

/**
 * 导入脑图笔记 - 通用接口
 *
 * 根据指定格式导入脑图笔记，自动选择合适的导入方法。
 * 提供统一的导入接口，简化调用逻辑。
 *
 * @param {string} parentKey - 父节点唯一标识
 * @param {unknown} data - 导入数据（可以是脑图树或 Markdown 内容）
 * @param {string} [title='导入的笔记'] - 脑图标题
 * @param {'json' | 'markdown'} [format='json'] - 导入格式
 * @returns {Promise<ApiResponse>} 导入结果响应
 *
 * @example
 * // 导入 JSON 格式
 * const jsonResponse = await importMoteData('parent123', moteTreeData, 'JSON笔记', 'json')
 *
 * // 导入 Markdown 格式
 * const mdResponse = await importMoteData('parent123', markdownContent, 'MD笔记', 'markdown')
 *
 * @throws {400} 当数据格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当父节点不存在时
 * @throws {500} 当服务器错误时
 */
export const importMoteData = async (
  parentKey: string,
  data: unknown,
  title: string = '导入的笔记',
  format: 'json' | 'markdown' = 'json'
) => {
  if (format === 'markdown') {
    return importMoteDataMarkdown(parentKey, data as string, title)
  } else {
    return importMoteDataJson(parentKey, data, title)
  }
}
