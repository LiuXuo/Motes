/**
 * 脑图笔记键盘事件管理 Store
 *
 * 负责管理脑图笔记的键盘快捷键功能，包括：
 * - 快捷键组合键的构建和识别
 * - 节点操作的键盘事件处理
 * - 编辑模式和浏览模式的快捷键切换
 * - 与节点操作 Store 的集成
 * - 支持思维导图和大纲笔记两种视图模式
 *
 * @class useKeyboardStore
 * @example
 * const keyboardStore = useKeyboardStore()
 * const handler = keyboardStore.createKeyboardHandler(isEditing, viewMode, selectedNodeId, moteTree, handlers)
 * document.addEventListener('keydown', handler)
 */

import { defineStore } from 'pinia'

/**
 * 脑图节点接口
 *
 * 定义脑图节点的基本数据结构。
 *
 * @interface MoteNode
 */
interface MoteNode {
  /** 节点唯一标识符 */
  id: string
  /** 节点文本内容 */
  text: string
  /** 节点是否折叠 */
  collapsed: boolean
  /** 父节点ID */
  parentId: string
  /** 子节点数组 */
  children?: MoteNode[]
}

/**
 * 视图模式类型
 *
 * 定义脑图笔记的显示模式。
 *
 * @typedef {'map' | 'note'} ViewMode
 */
type ViewMode = 'map' | 'note'

export const useKeyboardStore = defineStore('keyboardStore', () => {
  // ==================== 快捷键管理 ====================

  /**
   * 构建快捷键字符串
   *
   * 将键盘事件转换为标准化的快捷键字符串，
   * 包含修饰键（Ctrl、Shift、Alt、Meta）和主键。
   *
   * @param {KeyboardEvent} event - 键盘事件对象
   * @returns {string} 快捷键字符串，如 "Ctrl+Shift+A"
   *
   * @example
   * const keyCombo = keyboardStore.buildKeyCombo(event)
   * console.log('按下的快捷键:', keyCombo) // 例如: "Ctrl+Enter"
   */
  const buildKeyCombo = (event: KeyboardEvent): string => {
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event
    const modifiers = []
    if (ctrlKey) modifiers.push('Ctrl')
    if (shiftKey) modifiers.push('Shift')
    if (altKey) modifiers.push('Alt')
    if (metaKey) modifiers.push('Meta')
    return [...modifiers, key].join('+')
  }

  /**
   * 处理节点操作并返回新选中的节点ID
   *
   * 执行节点操作函数，如果操作返回新的节点ID则使用它，
   * 否则保持当前选中的节点ID。
   *
   * @param {() => string | void} operation - 节点操作函数
   * @param {string} selectedNodeId - 当前选中的节点ID
   * @returns {string} 新的选中节点ID
   *
   * @example
   * const newSelectedId = keyboardStore.executeNodeOperation(
   *   () => addChildNode('parentId'),
   *   'currentNodeId'
   * )
   *
   * @throws {Error} 当节点操作失败时
   */
  const executeNodeOperation = (operation: () => string | void, selectedNodeId: string): string => {
    if (!selectedNodeId) return ''

    try {
      const result = operation()
      if (typeof result === 'string') {
        return result
      }
      return selectedNodeId
    } catch (error) {
      console.error('节点操作失败:', error)
      return selectedNodeId
    }
  }

  /**
   * 创建键盘事件处理器
   *
   * 根据当前状态创建键盘事件处理函数，
   * 支持编辑模式和浏览模式的不同快捷键。
   *
   * @param {boolean} isEditing - 是否处于编辑模式
   * @param {ViewMode} viewMode - 当前视图模式
   * @param {string} selectedNodeId - 当前选中的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {Object} handlers - 各种操作的处理函数
   * @returns {(event: KeyboardEvent) => boolean} 键盘事件处理函数
   *
   * @example
   * const handler = keyboardStore.createKeyboardHandler(
   *   isEditing,
   *   viewMode,
   *   selectedNodeId,
   *   moteTree,
   *   handlers
   * )
   * document.addEventListener('keydown', handler)
   */
  const createKeyboardHandler = (
    isEditing: boolean,
    viewMode: ViewMode,
    selectedNodeId: string,
    moteTree: MoteNode,
    handlers: {
      resetEditingState: () => void
      clearSelection: () => void
      startEditing: () => void
      handleTextConfirm: () => void
      selectNode: (nodeId: string) => void
      addChildNode: (parentId: string) => string
      addSiblingNode: (nodeId: string) => string
      deleteNode: (nodeId: string) => void
      toggleNodeCollapse: (nodeId: string) => void
      proMoteNode: (nodeId: string) => void
      deMoteNode: (nodeId: string) => void
      moveNodeUp: (nodeId: string) => void
      moveNodeDown: (nodeId: string) => void
      findParentNode: (nodeId: string) => MoteNode | null
      findFirstChildNode: (nodeId: string) => MoteNode | null
      findSiblingNode: (nodeId: string, direction: 'prev' | 'next') => MoteNode | null
      findPreviousVisibleNode: (nodeId: string) => MoteNode | null
      findNextVisibleNode: (nodeId: string) => MoteNode | null
      hasChildren: (nodeId: string) => boolean
      canAddSibling: (nodeId: string) => boolean
      canDeleteNode: (nodeId: string) => boolean
      canProMoteNode: (nodeId: string) => boolean
      canDeMoteNode: (nodeId: string) => boolean
      canMoveUp: (nodeId: string) => boolean
      canMoveDown: (nodeId: string) => boolean
      findPreviousNode: (nodeId: string) => MoteNode | null
      isAiExpanding: boolean
      openAiExpandModal: (nodeId: string) => void
    }
  ) => {
    return (event: KeyboardEvent): boolean => {
      const keyCombo = buildKeyCombo(event)

      // 编辑模式下的快捷键
      if (isEditing) {
        if (keyCombo === 'Escape') {
          event.preventDefault()
          handlers.resetEditingState()
          return true
        }
        if (keyCombo === 'Enter') {
          event.preventDefault()
          handlers.handleTextConfirm()
          return true
        }
        return false
      }

      // 快捷键映射表
      const shortcuts: Record<string, () => void> = {
        F2: () => {
          if (selectedNodeId) {
            handlers.startEditing()
          }
        },
        Escape: () => {
          handlers.clearSelection()
        },
        Enter: () => {
          if (!selectedNodeId) return
          const newChildId = executeNodeOperation(() => handlers.addChildNode(selectedNodeId), selectedNodeId)
          if (newChildId) handlers.selectNode(newChildId)
        },
        'Shift+Enter': () => {
          if (!selectedNodeId) return
          if (handlers.canAddSibling(selectedNodeId)) {
            const newSiblingId = executeNodeOperation(() => handlers.addSiblingNode(selectedNodeId), selectedNodeId)
            if (newSiblingId) handlers.selectNode(newSiblingId)
          }
        },
        Delete: () => {
          if (!selectedNodeId) return
          if (handlers.canDeleteNode(selectedNodeId)) {
            const prevNode = handlers.findPreviousNode(selectedNodeId)
            handlers.deleteNode(selectedNodeId)
            handlers.selectNode(prevNode ? prevNode.id : '')
          }
        },
        'Alt+.': () => {
          if (!selectedNodeId) return
          if (handlers.hasChildren(selectedNodeId)) {
            handlers.toggleNodeCollapse(selectedNodeId)
          }
        },
        'Ctrl+ArrowLeft': () => {
          if (!selectedNodeId) return
          if (handlers.canProMoteNode(selectedNodeId)) {
            handlers.proMoteNode(selectedNodeId)
          }
        },
        'Shift+Tab': () => {
          if (!selectedNodeId) return
          if (handlers.canProMoteNode(selectedNodeId)) {
            handlers.proMoteNode(selectedNodeId)
          }
        },
        'Ctrl+ArrowRight': () => {
          if (!selectedNodeId) return
          if (handlers.canDeMoteNode(selectedNodeId)) {
            handlers.deMoteNode(selectedNodeId)
          }
        },
        Tab: () => {
          if (!selectedNodeId) return
          if (handlers.canDeMoteNode(selectedNodeId)) {
            handlers.deMoteNode(selectedNodeId)
          }
        },
        'Ctrl+ArrowUp': () => {
          if (!selectedNodeId) return
          if (handlers.canMoveUp(selectedNodeId)) {
            handlers.moveNodeUp(selectedNodeId)
          }
        },
        'Ctrl+ArrowDown': () => {
          if (!selectedNodeId) return
          if (handlers.canMoveDown(selectedNodeId)) {
            handlers.moveNodeDown(selectedNodeId)
          }
        },
        'Ctrl+e': () => {
          if (!selectedNodeId) return
          if (!handlers.isAiExpanding) {
            handlers.openAiExpandModal(selectedNodeId)
          }
        },
        ArrowLeft: () => {
          if (!selectedNodeId) return
          const parentNode = handlers.findParentNode(selectedNodeId)
          if (parentNode) {
            handlers.resetEditingState()
            handlers.selectNode(parentNode.id)
          }
        },
        ArrowRight: () => {
          if (!selectedNodeId) return
          const findNodeById = (nodeId: string, node: MoteNode): MoteNode | null => {
            if (node.id === nodeId) return node
            if (node.children) {
              for (const child of node.children) {
                const found = findNodeById(nodeId, child)
                if (found) return found
              }
            }
            return null
          }
          const currentNode = findNodeById(selectedNodeId, moteTree)
          if (currentNode && currentNode.collapsed && handlers.hasChildren(selectedNodeId)) {
            handlers.toggleNodeCollapse(selectedNodeId)
            return
          }

          const childNode = handlers.findFirstChildNode(selectedNodeId)
          if (childNode) {
            handlers.resetEditingState()
            handlers.selectNode(childNode.id)
          }
        },
        ArrowUp: () => {
          if (!selectedNodeId) {
            handlers.selectNode(moteTree.id)
            return
          }

          if (viewMode === 'note') {
            const prevNode = handlers.findPreviousVisibleNode(selectedNodeId)
            if (prevNode) {
              handlers.resetEditingState()
              handlers.selectNode(prevNode.id)
            }
          } else {
            const prevSibling = handlers.findSiblingNode(selectedNodeId, 'prev')
            if (prevSibling) {
              handlers.resetEditingState()
              handlers.selectNode(prevSibling.id)
            }
          }
        },
        ArrowDown: () => {
          if (!selectedNodeId) {
            handlers.selectNode(moteTree.id)
            return
          }

          if (viewMode === 'note') {
            const nextNode = handlers.findNextVisibleNode(selectedNodeId)
            if (nextNode) {
              handlers.resetEditingState()
              handlers.selectNode(nextNode.id)
            }
          } else {
            const nextSibling = handlers.findSiblingNode(selectedNodeId, 'next')
            if (nextSibling) {
              handlers.resetEditingState()
              handlers.selectNode(nextSibling.id)
            }
          }
        },
      }

      const handler = shortcuts[keyCombo]
      if (handler) {
        event.preventDefault()
        handler()
        return true
      }

      return false
    }
  }

  return {
    buildKeyCombo,
    executeNodeOperation,
    createKeyboardHandler,
  }
})
