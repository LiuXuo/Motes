import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDocTree, updateDocTree, createDocNode, renameDocNode, moveDocNode, deleteDocNode, permanentDeleteDocNode, duplicateDocNode, restoreDocNode } from '@/services/docApi'

// ==================== 接口定义 ====================
export interface DocNode {
  key: string
  title: string
  type: string
  isDeleted?: boolean
  children?: DocNode[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export const useDocStore = defineStore('docStore', () => {
  // ==================== 数据状态 ====================
  const docTree = ref<DocNode>({
    key: '',
    title: '',
    type: '',
    isDeleted: false,
    children: []
  })

  // 标记是否已经初始化过
  const isInitialized = ref<boolean>(false)

  // 侧边栏折叠状态
  const sidebarCollapsed = ref<boolean>(false)

  // 加载状态
  const isLoading = ref<boolean>(false)

  // ==================== API 方法 ====================

  // 获取文档树
  const fetchDocTree = async (): Promise<ApiResponse<{ docTree: DocNode }>> => {
    try {
      isLoading.value = true
      const data = await getDocTree()

      if (data.success && data.data) {
        docTree.value = data.data.docTree
        isInitialized.value = true
      } else {
        // 如果API返回失败，重置为默认状态
        resetDocTree()
      }

      return data
    } catch (error: any) {
      console.error('获取文档树失败:', error)
      // 发生错误时也重置为默认状态
      resetDocTree()
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取文档树失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 更新文档树
  const pushDocTree = async (newDocTree: DocNode): Promise<ApiResponse> => {
    try {
      isLoading.value = true
      const data = await updateDocTree(newDocTree)

      if (data.success) {
        docTree.value = newDocTree
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '更新文档树失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 创建文档节点
  const createNode = async (title: string, type: 'folder' | 'mote', parentKey: string): Promise<ApiResponse<{ newNode: DocNode }>> => {
    try {
      isLoading.value = true
      const data = await createDocNode(title, type, parentKey)

      if (data.success && data.data) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: '创建节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 重命名节点
  const renameNode = async (key: string, title: string): Promise<ApiResponse<{ updatedNode: DocNode }>> => {
    try {
      isLoading.value = true
      const data = await renameDocNode(key, title)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RENAME_ERROR',
          message: '重命名节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 移动节点
  const moveNode = async (key: string, newParentKey: string, position?: number): Promise<ApiResponse> => {
    try {
      isLoading.value = true
      const data = await moveDocNode(key, newParentKey, position)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'MOVE_ERROR',
          message: '移动节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 软删除节点
  const deleteNode = async (key: string): Promise<ApiResponse> => {
    try {
      isLoading.value = true
      const data = await deleteDocNode(key)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: '删除节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 硬删除节点（永久删除）
  const permanentDeleteNode = async (key: string): Promise<ApiResponse> => {
    try {
      isLoading.value = true
      const data = await permanentDeleteDocNode(key)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'PERMANENT_DELETE_ERROR',
          message: '永久删除节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 创建节点副本
  const duplicateNode = async (key: string): Promise<ApiResponse<{ duplicatedNode: DocNode }>> => {
    try {
      isLoading.value = true
      const data = await duplicateDocNode(key)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: '创建副本失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 恢复节点
  const restoreNode = async (key: string): Promise<ApiResponse> => {
    try {
      isLoading.value = true
      const data = await restoreDocNode(key)

      if (data.success) {
        // 重新获取文档树以保持同步
        await fetchDocTree()
      }

      return data
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RESTORE_ERROR',
          message: '恢复节点失败',
          details: error.response?.data?.error?.details || error.message
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 本地拖拽更新（临时更新，不调用API）
  const updateLocalDocTree = (newChildren: DocNode[]) => {
    // 直接更新根节点的children
    docTree.value.children = newChildren
    pushDocTree(docTree.value)
  }

  // 重置文档树（用于用户登出时）
  const resetDocTree = () => {
    docTree.value = {
      key: '',
      title: '',
      type: '',
      isDeleted: false,
      children: []
    }
    isInitialized.value = false
  }

  return {
    // 状态
    docTree,
    sidebarCollapsed,
    isLoading,
    isInitialized,

    // 方法
    fetchDocTree,
    pushDocTree,
    createNode,
    renameNode,
    moveNode,
    deleteNode,
    permanentDeleteNode,
    duplicateNode,
    restoreNode,
    updateLocalDocTree,
    resetDocTree,
  }
})
