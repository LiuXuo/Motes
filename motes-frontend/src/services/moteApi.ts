import api from './api'

// ==================== 脑图笔记API ====================

/**
 * 获取脑图笔记数据
 * @param docKey 文档key
 * @returns 脑图笔记数据
 */
export const getMoteData = async (docKey: string) => {
  const response = await api.get(`/mote/${docKey}`)
  return response.data
}

/**
 * 更新脑图笔记数据
 * @param docKey 文档key
 * @param moteTree 脑图树数据
 * @returns 更新结果
 */
export const updateMoteData = async (docKey: string, moteTree: any) => {
  const response = await api.put(`/mote/${docKey}`, { moteTree })
  return response.data
}

/**
 * 导出脑图笔记
 * @param docKey 文档key
 * @param format 导出格式 (json, markdown)
 * @returns 导出数据
 */
export const exportMoteData = async (docKey: string, format: 'json' | 'markdown' = 'json') => {
  const response = await api.get(`/mote/${docKey}/export?format=${format}`)
  return response.data
}

/**
 * 导入脑图笔记 - JSON格式
 * @param parentKey 父节点key
 * @param moteTree 脑图树数据
 * @param title 标题
 * @returns 导入结果
 */
export const importMoteDataJson = async (parentKey: string, moteTree: any, title: string = '导入的笔记') => {
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
 * @param parentKey 父节点key
 * @param markdownContent Markdown内容
 * @param title 标题
 * @returns 导入结果
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
 * @param parentKey 父节点key
 * @param data 导入数据（可以是脑图树或Markdown内容）
 * @param title 标题
 * @param format 导入格式
 * @returns 导入结果
 */
export const importMoteData = async (
  parentKey: string,
  data: any,
  title: string = '导入的笔记',
  format: 'json' | 'markdown' = 'json'
) => {
  if (format === 'markdown') {
    return importMoteDataMarkdown(parentKey, data, title)
  } else {
    return importMoteDataJson(parentKey, data, title)
  }
}
