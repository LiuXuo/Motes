import api from './api'

// ==================== 文档管理API ====================

/**
 * 获取文档树
 * @returns 文档树数据
 */
export const getDocTree = async () => {
  const response = await api.get('/doc/tree')
  return response.data
}

/**
 * 更新文档树
 * @param docTree 文档树数据
 * @returns 更新响应
 */
export const updateDocTree = async (docTree: any) => {
  const response = await api.put('/doc/tree', { docTree })
  return response.data
}

/**
 * 创建文档节点
 * @param title 节点标题
 * @param type 节点类型 (folder | mote)
 * @param parentKey 父节点key
 * @returns 创建响应
 */
export const createDocNode = async (title: string, type: 'folder' | 'mote', parentKey: string) => {
  const response = await api.post('/doc/node', { title, type, parentKey })
  return response.data
}

/**
 * 重命名文档节点
 * @param key 节点key
 * @param title 新标题
 * @returns 重命名响应
 */
export const renameDocNode = async (key: string, title: string) => {
  const response = await api.put(`/doc/node/${key}/rename`, { title })
  return response.data
}

/**
 * 移动文档节点
 * @param key 节点key
 * @param newParentKey 新父节点key
 * @param position 位置索引
 * @returns 移动响应
 */
export const moveDocNode = async (key: string, newParentKey: string, position?: number) => {
  const response = await api.put(`/doc/node/${key}/move`, { newParentKey, position })
  return response.data
}

/**
 * 软删除文档节点
 * @param key 节点key
 * @returns 删除响应
 */
export const deleteDocNode = async (key: string) => {
  const response = await api.put(`/doc/node/${key}/delete`)
  return response.data
}

/**
 * 永久删除文档节点
 * @param key 节点key
 * @returns 永久删除响应
 */
export const permanentDeleteDocNode = async (key: string) => {
  const response = await api.delete(`/doc/node/${key}/permanent`)
  return response.data
}

/**
 * 创建文档节点副本
 * @param key 节点key
 * @returns 副本创建响应
 */
export const duplicateDocNode = async (key: string) => {
  const response = await api.post(`/doc/node/${key}/duplicate`)
  return response.data
}

/**
 * 恢复文档节点
 * @param key 节点key
 * @returns 恢复响应
 */
export const restoreDocNode = async (key: string) => {
  const response = await api.put(`/doc/node/${key}/restore`)
  return response.data
}
