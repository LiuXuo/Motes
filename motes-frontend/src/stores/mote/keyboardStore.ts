import { defineStore } from 'pinia'

interface MoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

type ViewMode = 'map' | 'note'

export const useKeyboardStore = defineStore('keyboardStore', () => {
  // ==================== 快捷键管理 ====================

  /**
   * 构建快捷键字符串
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
   * 创建快捷键处理器
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
