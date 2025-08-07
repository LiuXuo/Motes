import { defineStore } from 'pinia'
import { generateId } from '@/utils'

interface MoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

export const useNodeOperationsStore = defineStore('nodeOperationsStore', () => {
  // ==================== 节点操作工具 ====================

  /**
   * 从父节点中删除指定节点
   */
  const removeNodeFromParent = (nodeId: string, parent: MoteNode): boolean => {
    if (parent.children) {
      const index = parent.children.findIndex((child) => child.id === nodeId)
      if (index !== -1) {
        parent.children.splice(index, 1)
        return true
      }
    }
    return false
  }

  /**
   * 标记文档为已修改状态
   */
  const markAsDirty = (isDirty: { value: boolean }) => {
    isDirty.value = true
  }

  // ==================== 节点操作 ====================

  /**
   * 添加子节点
   */
  const addChildNode = (parentId: string, moteTree: MoteNode, isDirty: { value: boolean }): string => {
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

    const parent = findNodeById(parentId, moteTree)
    if (!parent) {
      throw new Error(`Parent node with id ${parentId} not found`)
    }

    if (parent.collapsed) {
      parent.collapsed = false
    }

    const newNodeId = generateId()
    const newNode: MoteNode = {
      id: newNodeId,
      text: '请输入内容',
      collapsed: false,
      parentId: parentId,
      children: [],
    }

    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(newNode)

    markAsDirty(isDirty)
    return newNodeId
  }

  /**
   * 添加同级节点
   */
  const addSiblingNode = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): string => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot add sibling to root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    const newNodeId = generateId()
    const newNode: MoteNode = {
      id: newNodeId,
      text: '请输入内容',
      collapsed: false,
      parentId: parent.id,
      children: [],
    }

    if (!parent.children) {
      parent.children = []
    }

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    parent.children.splice(nodeIndex + 1, 0, newNode)

    markAsDirty(isDirty)
    return newNodeId
  }

  /**
   * 删除节点
   */
  const deleteNode = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot delete root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    removeNodeFromParent(nodeId, parent)
    markAsDirty(isDirty)
  }

  /**
   * 切换节点的折叠/展开状态
   */
  const toggleNodeCollapse = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }, hasChildren: (nodeId: string, moteTree: MoteNode) => boolean): void => {
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

    const node = findNodeById(nodeId, moteTree)
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    if (!hasChildren(nodeId, moteTree)) {
      throw new Error('Leaf nodes cannot be collapsed')
    }

    node.collapsed = !node.collapsed
    markAsDirty(isDirty)
  }

  /**
   * 编辑节点文本内容
   */
  const editNodeText = (nodeId: string, newText: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
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

    const node = findNodeById(nodeId, moteTree)
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    node.text = newText
    markAsDirty(isDirty)
  }

  /**
   * 节点降级（降低层级）
   */
  const deMoteNode = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot demote root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    if (!parent.children || parent.children.length <= 1) {
      throw new Error('Node has no siblings to demote to')
    }

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    if (nodeIndex === 0) {
      throw new Error('Cannot demote first child node')
    }

    const newParent = parent.children[nodeIndex - 1]
    removeNodeFromParent(nodeId, parent)

    if (!newParent.children) {
      newParent.children = []
    }
    newParent.children.push(node)
    node.parentId = newParent.id

    markAsDirty(isDirty)
  }

  /**
   * 节点升级（提升层级）
   */
  const proMoteNode = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    const findParentNode = (nodeId: string, moteTree: MoteNode): MoteNode | null => {
      const findParent = (node: MoteNode, targetId: string): MoteNode | null => {
        if (node.children) {
          for (const child of node.children) {
            if (child.id === targetId) return node
            const result = findParent(child, targetId)
            if (result) return result
          }
        }
        return null
      }
      return findParent(moteTree, nodeId)
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot promote root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    if (parent.id === moteTree.id) {
      throw new Error('Cannot promote node whose parent is root')
    }

    const grandParent = findParentNode(parent.id, moteTree)
    if (!grandParent) {
      throw new Error('Grandparent not found')
    }

    removeNodeFromParent(nodeId, parent)

    const parentIndex = grandParent.children!.findIndex((child) => child.id === parent.id)
    if (parentIndex === -1) {
      throw new Error('Parent not found in grandparent children')
    }

    grandParent.children!.splice(parentIndex + 1, 0, node)
    node.parentId = grandParent.id

    markAsDirty(isDirty)
  }

  /**
   * 节点上移（在同层级中向上移动）
   */
  const moveNodeUp = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot move root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    if (!parent.children || parent.children.length <= 1) {
      throw new Error('Node has no siblings to move up')
    }

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    if (nodeIndex === 0) {
      throw new Error('Cannot move up first child node')
    }

    const temp = parent.children[nodeIndex]
    parent.children[nodeIndex] = parent.children[nodeIndex - 1]
    parent.children[nodeIndex - 1] = temp

    markAsDirty(isDirty)
  }

  /**
   * 节点下移（在同层级中向下移动）
   */
  const moveNodeDown = (nodeId: string, moteTree: MoteNode, isDirty: { value: boolean }): void => {
    const findNodeAndParent = (
      nodeId: string,
      node: MoteNode,
    ): { node: MoteNode | null; parent: MoteNode | null } => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === nodeId) {
            return { node: child, parent: node }
          }
          const result = findNodeAndParent(nodeId, child)
          if (result.node) return result
        }
      }
      return { node: null, parent: null }
    }

    if (nodeId === moteTree.id) {
      throw new Error('Cannot move root node')
    }

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    if (!parent.children || parent.children.length <= 1) {
      throw new Error('Node has no siblings to move down')
    }

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    if (nodeIndex === parent.children.length - 1) {
      throw new Error('Cannot move down last child node')
    }

    const temp = parent.children[nodeIndex]
    parent.children[nodeIndex] = parent.children[nodeIndex + 1]
    parent.children[nodeIndex + 1] = temp

    markAsDirty(isDirty)
  }

  return {
    removeNodeFromParent,
    markAsDirty,
    addChildNode,
    addSiblingNode,
    deleteNode,
    toggleNodeCollapse,
    editNodeText,
    deMoteNode,
    proMoteNode,
    moveNodeUp,
    moveNodeDown,
  }
})
