import { defineStore } from 'pinia'

interface MoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

export const useNodeStateStore = defineStore('nodeStateStore', () => {
  // ==================== 节点状态判断 ====================

  /**
   * 根据ID递归查找节点
   */
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

  /**
   * 查找节点和父节点
   */
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

  /**
   * 判断节点是否有子节点
   */
  const hasChildren = (nodeId: string, moteTree: MoteNode): boolean => {
    const node = findNodeById(nodeId, moteTree)
    return !!(node?.children && node.children.length > 0)
  }

  /**
   * 判断节点是否处于折叠状态
   */
  const isNodeCollapsed = (nodeId: string, moteTree: MoteNode): boolean => {
    const node = findNodeById(nodeId, moteTree)
    return node?.collapsed || false
  }

  /**
   * 判断是否可以添加同级节点
   */
  const canAddSibling = (nodeId: string, rootNodeId: string): boolean => {
    return nodeId !== rootNodeId
  }

  /**
   * 判断是否可以删除节点
   */
  const canDeleteNode = (nodeId: string, rootNodeId: string): boolean => {
    return nodeId !== rootNodeId
  }

  /**
   * 判断节点是否可以升级（提升层级）
   */
  const canProMoteNode = (nodeId: string, moteTree: MoteNode): boolean => {
    if (nodeId === moteTree.id) return false

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) return false

    return parent.id !== moteTree.id
  }

  /**
   * 判断节点是否可以降级（降低层级）
   */
  const canDeMoteNode = (nodeId: string, moteTree: MoteNode): boolean => {
    if (nodeId === moteTree.id) return false

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) return false

    if (!parent.children || parent.children.length <= 1) return false

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    return nodeIndex > 0
  }

  /**
   * 判断节点是否可以上移
   */
  const canMoveUp = (nodeId: string, moteTree: MoteNode): boolean => {
    if (nodeId === moteTree.id) return false

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) return false

    if (!parent.children || parent.children.length <= 1) return false

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    return nodeIndex > 0
  }

  /**
   * 判断节点是否可以下移
   */
  const canMoveDown = (nodeId: string, moteTree: MoteNode): boolean => {
    if (nodeId === moteTree.id) return false

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) return false

    if (!parent.children || parent.children.length <= 1) return false

    const nodeIndex = parent.children.findIndex((child) => child.id === nodeId)
    return nodeIndex < parent.children.length - 1
  }

  return {
    findNodeById,
    findNodeAndParent,
    hasChildren,
    isNodeCollapsed,
    canAddSibling,
    canDeleteNode,
    canProMoteNode,
    canDeMoteNode,
    canMoveUp,
    canMoveDown,
  }
})
