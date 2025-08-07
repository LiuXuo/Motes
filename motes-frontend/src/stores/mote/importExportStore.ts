import { defineStore } from 'pinia'
import { ref } from 'vue'
import { exportMoteData, importMoteData } from '@/services/moteApi'
import { message } from 'ant-design-vue'

type ExportFormat = 'json' | 'markdown'

export const useImportExportStore = defineStore('importExportStore', () => {
  // ==================== 导入导出功能 ====================

  /**
   * 读取文件内容
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
