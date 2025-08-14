/**
 * 文档管理状态管理 Store
 *
 * 负责管理文档树结构和相关操作，包括：
 * - 文档树的获取、更新和同步
 * - 文档节点的增删改查操作
 * - 文档的软删除和恢复功能
 * - 侧边栏折叠状态管理
 * - 与后端 API 的数据同步
 *
 * @class useDocStore
 * @example
 * const docStore = useDocStore()
 * await docStore.fetchDocTree()
 * const result = await docStore.createNode('新文档', 'mote', 'parentKey')
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDocTree, updateDocTree, createDocNode, renameDocNode, moveDocNode, deleteDocNode, permanentDeleteDocNode, duplicateDocNode, restoreDocNode } from '@/services/docApi'

// ==================== 接口定义 ====================

/**
 * 文档节点接口
 *
 * 定义文档树中每个节点的数据结构，
 * 支持文件夹和脑图笔记两种类型。
 *
 * @interface DocNode
 */
export interface DocNode {
  /** 节点唯一标识符 */
  key: string
  /** 节点标题 */
  title: string
  /** 节点类型：folder(文件夹) 或 mote(脑图笔记) */
  type: string
  /** 是否已删除（软删除标记） */
  isDeleted?: boolean
  /** 子节点数组 */
  children?: DocNode[]
}

/**
 * API 响应接口
 *
 * 定义所有 API 调用的通用响应结构，
 * 包含成功和失败两种情况。
 *
 * @interface ApiResponse
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T = any> {
  /** 操作是否成功 */
  success: boolean
  /** 成功时的数据 */
  data?: T
  /** 响应消息 */
  message?: string
  /** 失败时的错误信息 */
  error?: {
    /** 错误代码 */
    code: string
    /** 错误消息 */
    message: string
    /** 错误详情 */
    details?: string
  }
}

export const useDocStore = defineStore('docStore', () => {

  // ==================== 数据状态 ====================

  /** 文档树根节点 */
  const docTree = ref<DocNode>({
    key: '',
    title: '',
    type: '',
    isDeleted: false,
    children: []
  })

  /** 标记是否已经初始化过 */
  const isInitialized = ref<boolean>(false)

  /** 侧边栏折叠状态 */
  const sidebarCollapsed = ref<boolean>(false)

  /** 加载状态 */
  const isLoading = ref<boolean>(false)

  // ==================== API 方法 ====================

  /**
   * 获取文档树
   *
   * 从后端获取完整的文档树结构，
   * 包括所有文件夹和脑图笔记的层级关系。
   *
   * @returns {Promise<ApiResponse<{ docTree: DocNode }>>} 获取结果
   *
   * @example
   * const result = await docStore.fetchDocTree()
   * if (result.success) {
   *   console.log('文档树获取成功')
   * } else {
   *   console.error('获取失败:', result.error?.message)
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当用户未授权时
   */
  const fetchDocTree = async (language?: 'zh-CN' | 'en-US'): Promise<ApiResponse<{ docTree: DocNode }>> => {
    try {
      isLoading.value = true
      const data = await getDocTree(language)

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

  /**
   * 更新文档树
   *
   * 将本地文档树数据推送到后端进行保存，
   * 通常用于拖拽操作后的数据同步。
   *
   * @param {DocNode} newDocTree - 新的文档树数据
   * @returns {Promise<ApiResponse>} 更新结果
   *
   * @example
   * const result = await docStore.pushDocTree(updatedTree)
   * if (result.success) {
   *   message.success('保存成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   */
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

  /**
   * 创建文档节点
   *
   * 在指定父节点下创建新的文件夹或脑图笔记，
   * 创建成功后会自动刷新文档树。
   *
   * @param {string} title - 节点标题
   * @param {'folder' | 'mote'} type - 节点类型
   * @param {string} parentKey - 父节点标识符
   * @returns {Promise<ApiResponse<{ newNode: DocNode }>>} 创建结果
   *
   * @example
   * const result = await docStore.createNode('新脑图', 'mote', 'parentFolderKey')
   * if (result.success) {
   *   console.log('创建成功:', result.data?.newNode)
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当父节点不存在时
   */
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

  /**
   * 重命名节点
   *
   * 修改指定节点的标题，
   * 重命名成功后会自动刷新文档树。
   *
   * @param {string} key - 节点标识符
   * @param {string} title - 新的标题
   * @returns {Promise<ApiResponse<{ updatedNode: DocNode }>>} 重命名结果
   *
   * @example
   * const result = await docStore.renameNode('nodeKey', '新标题')
   * if (result.success) {
   *   message.success('重命名成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当节点不存在时
   */
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

  /**
   * 移动节点
   *
   * 将节点移动到新的父节点下，
   * 支持指定在子节点中的位置。
   *
   * @param {string} key - 要移动的节点标识符
   * @param {string} newParentKey - 新的父节点标识符
   * @param {number} [position] - 在子节点中的位置（可选）
   * @returns {Promise<ApiResponse>} 移动结果
   *
   * @example
   * const result = await docStore.moveNode('nodeKey', 'newParentKey', 0)
   * if (result.success) {
   *   message.success('移动成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当目标父节点不存在时
   */
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

  /**
   * 软删除节点
   *
   * 将节点标记为已删除状态，但不会真正删除数据，
   * 可以在回收站中恢复。
   *
   * @param {string} key - 要删除的节点标识符
   * @returns {Promise<ApiResponse>} 删除结果
   *
   * @example
   * const result = await docStore.deleteNode('nodeKey')
   * if (result.success) {
   *   message.success('删除成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当节点不存在时
   */
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

  /**
   * 硬删除节点（永久删除）
   *
   * 永久删除节点及其所有子节点，
   * 此操作不可恢复，请谨慎使用。
   *
   * @param {string} key - 要永久删除的节点标识符
   * @returns {Promise<ApiResponse>} 删除结果
   *
   * @example
   * const result = await docStore.permanentDeleteNode('nodeKey')
   * if (result.success) {
   *   message.success('永久删除成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当节点不存在时
   */
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

  /**
   * 创建节点副本
   *
   * 复制指定节点及其所有子节点，
   * 副本会保持原有的层级结构。
   *
   * @param {string} key - 要复制的节点标识符
   * @returns {Promise<ApiResponse<{ duplicatedNode: DocNode }>>} 复制结果
   *
   * @example
   * const result = await docStore.duplicateNode('nodeKey')
   * if (result.success) {
   *   console.log('复制成功:', result.data?.duplicatedNode)
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当节点不存在时
   */
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

  /**
   * 恢复节点
   *
   * 从回收站恢复已删除的节点，
   * 恢复后节点会重新出现在文档树中。
   *
   * @param {string} key - 要恢复的节点标识符
   * @returns {Promise<ApiResponse>} 恢复结果
   *
   * @example
   * const result = await docStore.restoreNode('deletedNodeKey')
   * if (result.success) {
   *   message.success('恢复成功')
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当节点不存在时
   */
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

  /**
   * 本地拖拽更新（临时更新，不调用API）
   *
   * 用于拖拽操作时的临时状态更新，
   * 更新后会自动调用 pushDocTree 进行同步。
   *
   * @param {DocNode[]} newChildren - 新的子节点数组
   *
   * @example
   * docStore.updateLocalDocTree(updatedChildren)
   */
  const updateLocalDocTree = (newChildren: DocNode[]) => {
    // 直接更新根节点的children
    docTree.value.children = newChildren
    pushDocTree(docTree.value)
  }

  /**
   * 重置文档树（用于用户登出时）
   *
   * 清空所有文档树数据，恢复到初始状态，
   * 通常在用户登出时调用。
   *
   * @example
   * docStore.resetDocTree()
   */
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
