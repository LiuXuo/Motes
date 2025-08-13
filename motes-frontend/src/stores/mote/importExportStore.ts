/**
 * 脑图笔记导入导出状态管理 Store
 *
 * 负责管理脑图笔记的导入导出功能，包括：
 * - 文件读取和下载功能
 * - JSON 和 Markdown 格式的导入导出
 * - 文件格式验证和错误处理
 * - 用户友好的消息提示
 *
 * @class useImportExportStore
 * @example
 * const importExportStore = useImportExportStore()
 * const success = await importExportStore.importDocument('parentKey', file, 'json')
 */
import { defineStore } from 'pinia'
import { exportMoteData, importMoteData } from '@/services/moteApi'
import { message } from 'ant-design-vue'

/**
 * 导出格式类型
 *
 * 支持的导出格式：JSON 和 Markdown。
 *
 * @typedef {'json' | 'markdown'} ExportFormat
 */
type ExportFormat = 'json' | 'markdown'

export const useImportExportStore = defineStore('importExportStore', () => {
  // ==================== 导入导出功能 ====================

  /**
   * 读取文件内容
   *
   * 使用 FileReader API 异步读取文件内容，
   * 返回文件的文本内容。
   *
   * @param {File} file - 要读取的文件对象
   * @returns {Promise<string>} 文件内容
   *
   * @example
   * const content = await importExportStore.readFileContent(file)
   * console.log('文件内容:', content)
   *
   * @throws {Error} 当文件读取失败时
   */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  /**
   * 下载文件
   *
   * 将 Base64 编码的数据转换为文件并触发下载，
   * 支持 JSON 和 Markdown 格式。
   *
   * @param {string} dataUrl - Base64 编码的数据 URL
   * @param {string} filename - 下载文件名
   * @returns {Promise<void>} 下载完成
   *
   * @example
   * await importExportStore.downloadFile('data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ==', 'export.json')
   *
   * @throws {Error} 当数据格式无效时
   */
  const downloadFile = async (dataUrl: string, filename: string): Promise<void> => {
    const base64Content = dataUrl.split(',')[1]
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], {
      type: filename.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 导入文档
   *
   * 将文件导入为脑图笔记，支持 JSON 和 Markdown 格式。
   * 导入成功后会在指定父节点下创建新的文档。
   *
   * @param {string} parentKey - 父节点标识符
   * @param {File} file - 要导入的文件
   * @param {ExportFormat} [format='json'] - 文件格式
   * @returns {Promise<boolean>} 导入是否成功
   *
   * @example
   * const success = await importExportStore.importDocument('parentKey', file, 'json')
   * if (success) {
   *   console.log('导入成功')
   * }
   *
   * @throws {Error} 当文件读取失败时
   * @throws {Error} 当 JSON 解析失败时
   * @throws {Error} 当 API 调用失败时
   */
  const importDocument = async (parentKey: string, file: File, format: ExportFormat = 'json'): Promise<boolean> => {
    try {
      const content = await readFileContent(file)
      const fileName = file.name.replace(/\.[^/.]+$/, '')

      if (format === 'json') {
        const jsonData = JSON.parse(content)
        const result = await importMoteData(parentKey, jsonData, fileName, 'json')
        if (result.success) {
          message.success('JSON文档导入成功')
          return true
        } else {
          message.error(result.error?.message || '导入失败')
          return false
        }
      } else if (format === 'markdown') {
        const result = await importMoteData(parentKey, content, fileName, 'markdown')
        if (result.success) {
          message.success('Markdown文档导入成功')
          return true
        } else {
          message.error(result.error?.message || '导入失败')
          return false
        }
      }

      return false
    } catch (error) {
      console.error('文件导入失败:', error)
      message.error('文件导入失败，请检查文件格式')
      return false
    }
  }

  /**
   * 导出当前文档
   *
   * 将当前打开的脑图笔记导出为文件，
   * 支持 JSON 和 Markdown 格式。
   *
   * @param {string} currentDocKey - 当前文档标识符
   * @param {ExportFormat} [format='json'] - 导出格式
   * @returns {Promise<boolean>} 导出是否成功
   *
   * @example
   * const success = await importExportStore.exportCurrentDocument('docKey', 'markdown')
   * if (success) {
   *   console.log('导出成功')
   * }
   *
   * @throws {Error} 当文档不存在时
   * @throws {Error} 当 API 调用失败时
   * @throws {Error} 当文件下载失败时
   */
  const exportCurrentDocument = async (currentDocKey: string, format: ExportFormat = 'json'): Promise<boolean> => {
    try {
      if (!currentDocKey) {
        message.error('没有打开的文档')
        return false
      }

      const result = await exportMoteData(currentDocKey, format)

      if (result.success) {
        const { filename, content } = result.data
        await downloadFile(content, filename)
        message.success('文档导出成功')
        return true
      } else {
        message.error(result.error?.message || '导出失败')
        return false
      }
    } catch (error) {
      console.error('导出文档失败:', error)
      message.error('导出失败，网络错误')
      return false
    }
  }

  return {
    readFileContent,
    downloadFile,
    importDocument,
    exportCurrentDocument,
  }
})
