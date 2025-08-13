/**
 * 文档管理 API 服务
 *
 * 封装与后端文档管理相关的 API 调用，包括：
 * - 文档树结构管理
 * - 文档节点操作（增删改查）
 * - 文档移动和重命名
 * - 软删除和恢复
 * - 文档副本创建
 *
 * 支持文件夹和脑图笔记两种文档类型，提供完整的文档生命周期管理。
 *
 * @class DocApiService
 */
import api from './api'

// ==================== 文档管理API ====================

/**
 * 获取文档树
 *
 * 获取当前用户的完整文档树结构，包括所有文件夹和脑图笔记。
 * 文档树采用层级结构，支持无限嵌套。
 *
 * @returns {Promise<ApiResponse>} 文档树数据响应
 *
 * @example
 * const response = await getDocTree()
 * if (response.success) {
 *   docStore.setDocTree(response.data)
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {500} 当服务器错误时
 */
export const getDocTree = async () => {
  const response = await api.get('/doc/tree')
  return response.data
}

/**
 * 更新文档树
 *
 * 批量更新整个文档树结构，用于同步前端的文档树变更。
 * 通常在文档树发生重大变更时调用。
 *
 * @param {unknown} docTree - 完整的文档树数据
 * @returns {Promise<ApiResponse>} 更新响应
 *
 * @example
 * const response = await updateDocTree(newDocTree)
 * if (response.success) {
 *   message.success('文档树更新成功')
 * }
 *
 * @throws {400} 当文档树数据格式错误时
 * @throws {401} 当用户未登录时
 * @throws {500} 当服务器错误时
 */
export const updateDocTree = async (docTree: unknown) => {
  const response = await api.put('/doc/tree', { docTree })
  return response.data
}

/**
 * 创建文档节点
 *
 * 在指定父节点下创建新的文档节点，支持文件夹和脑图笔记两种类型。
 * 创建后会自动更新文档树结构。
 *
 * @param {string} title - 节点标题
 * @param {'folder' | 'mote'} type - 节点类型（folder: 文件夹, mote: 脑图笔记）
 * @param {string} parentKey - 父节点唯一标识
 * @returns {Promise<ApiResponse>} 创建响应，包含新节点的信息
 *
 * @example
 * // 创建文件夹
 * const folderResponse = await createDocNode('新文件夹', 'folder', 'parent123')
 *
 * // 创建脑图笔记
 * const moteResponse = await createDocNode('新笔记', 'mote', 'parent123')
 *
 * @throws {400} 当参数格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当父节点不存在时
 * @throws {500} 当服务器错误时
 */
export const createDocNode = async (title: string, type: 'folder' | 'mote', parentKey: string) => {
  const response = await api.post('/doc/node', { title, type, parentKey })
  return response.data
}

/**
 * 重命名文档节点
 *
 * 修改指定文档节点的标题，支持文件夹和脑图笔记的重命名。
 *
 * @param {string} key - 节点唯一标识
 * @param {string} title - 新标题
 * @returns {Promise<ApiResponse>} 重命名响应
 *
 * @example
 * const response = await renameDocNode('node123', '新标题')
 * if (response.success) {
 *   message.success('重命名成功')
 * }
 *
 * @throws {400} 当标题为空或格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点不存在时
 * @throws {500} 当服务器错误时
 */
export const renameDocNode = async (key: string, title: string) => {
  const response = await api.put(`/doc/node/${key}/rename`, { title })
  return response.data
}

/**
 * 移动文档节点
 *
 * 将指定节点移动到新的父节点下，支持指定位置索引。
 * 移动操作会保持节点的所有子节点结构。
 *
 * @param {string} key - 要移动的节点唯一标识
 * @param {string} newParentKey - 新父节点的唯一标识
 * @param {number} [position] - 在新父节点下的位置索引（可选）
 * @returns {Promise<ApiResponse>} 移动响应
 *
 * @example
 * // 移动到指定父节点
 * const response = await moveDocNode('node123', 'newParent456')
 *
 * // 移动到指定位置
 * const response = await moveDocNode('node123', 'newParent456', 2)
 *
 * @throws {400} 当参数格式错误时
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点或新父节点不存在时
 * @throws {500} 当服务器错误时
 */
export const moveDocNode = async (key: string, newParentKey: string, position?: number) => {
  const response = await api.put(`/doc/node/${key}/move`, { newParentKey, position })
  return response.data
}

/**
 * 软删除文档节点
 *
 * 将指定节点标记为已删除状态，节点会被移动到回收站。
 * 软删除的节点可以通过恢复操作重新使用。
 *
 * @param {string} key - 要删除的节点唯一标识
 * @returns {Promise<ApiResponse>} 删除响应
 *
 * @example
 * const response = await deleteDocNode('node123')
 * if (response.success) {
 *   message.success('删除成功，可在回收站中恢复')
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点不存在时
 * @throws {500} 当服务器错误时
 */
export const deleteDocNode = async (key: string) => {
  const response = await api.put(`/doc/node/${key}/delete`)
  return response.data
}

/**
 * 永久删除文档节点
 *
 * 从数据库中永久删除指定节点，此操作不可恢复。
 * 通常用于清理回收站中的文档。
 *
 * @param {string} key - 要永久删除的节点唯一标识
 * @returns {Promise<ApiResponse>} 永久删除响应
 *
 * @example
 * const response = await permanentDeleteDocNode('node123')
 * if (response.success) {
 *   message.success('永久删除成功')
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点不存在时
 * @throws {500} 当服务器错误时
 */
export const permanentDeleteDocNode = async (key: string) => {
  const response = await api.delete(`/doc/node/${key}/permanent`)
  return response.data
}

/**
 * 创建文档节点副本
 *
 * 复制指定节点及其所有子节点，创建完整的副本。
 * 副本会保持原有的层级结构和内容。
 *
 * @param {string} key - 要复制的节点唯一标识
 * @returns {Promise<ApiResponse>} 副本创建响应，包含新节点的信息
 *
 * @example
 * const response = await duplicateDocNode('node123')
 * if (response.success) {
 *   message.success('副本创建成功')
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点不存在时
 * @throws {500} 当服务器错误时
 */
export const duplicateDocNode = async (key: string) => {
  const response = await api.post(`/doc/node/${key}/duplicate`)
  return response.data
}

/**
 * 恢复文档节点
 *
 * 从回收站中恢复软删除的节点，将其重新放回文档树中。
 * 恢复的节点会保持原有的层级关系。
 *
 * @param {string} key - 要恢复的节点唯一标识
 * @returns {Promise<ApiResponse>} 恢复响应
 *
 * @example
 * const response = await restoreDocNode('node123')
 * if (response.success) {
 *   message.success('恢复成功')
 * }
 *
 * @throws {401} 当用户未登录时
 * @throws {404} 当节点不存在时
 * @throws {500} 当服务器错误时
 */
export const restoreDocNode = async (key: string) => {
  const response = await api.put(`/doc/node/${key}/restore`)
  return response.data
}
