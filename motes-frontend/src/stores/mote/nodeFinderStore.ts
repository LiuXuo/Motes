import { defineStore } from 'pinia'

interface MoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

type NodeDirection = 'prev' | 'next'

export const useNodeFinderStore = defineStore('nodeFinderStore', () => {
  // ==================== 节点查找工具 ====================

  /**
   * 查找节点文本
   */
  const findNodeText = (data: MoteNode, targetId: string): string => {
    if (data.id === targetId) return data.text
    if (data.children) {
      for (const child of data.children) {
        const result = findNodeText(child, targetId)
        if (result) return result
      }
    }
    return ''
  }

  /**
   * 查找父节点
   */
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

  /**
   * 查找第一个子节点
   */
  const findFirstChildNode = (nodeId: string, moteTree: MoteNode): MoteNode | null => {
    const findNode = (node: MoteNode, targetId: string): MoteNode | null => {
      if (node.id === targetId) {
        return node.children && node.children.length > 0 ? node.children[0] : null
      }
      if (node.children) {
        for (const child of node.children) {
          const result = findNode(child, targetId)
          if (result) return result
        }
      }
      return null
    }
    return findNode(moteTree, nodeId)
  }

  /**
   * 查找节点和其父节点
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
   * 查找兄弟节点
   */
  const findSiblingNode = (nodeId: string, direction: NodeDirection, moteTree: MoteNode): MoteNode | null => {
    const { parent } = findNodeAndParent(nodeId, moteTree)
    if (!parent) return null

    const currentIndex = parent.children!.findIndex((child) => child.id === nodeId)
    if (direction === 'prev') {
      return currentIndex > 0 ? parent.children![currentIndex - 1] : null
    } else {
      return currentIndex >= 0 && currentIndex < parent.children!.length - 1
        ? parent.children![currentIndex + 1]
        : null
    }
  }

  // ==================== 节点导航工具 ====================

  /**
   * 获取所有节点的扁平化列表（包括被折叠的）
   */
  const getAllNodes = (node: MoteNode): MoteNode[] => {
    const nodes: MoteNode[] = [node]
    if (node.children) {
      for (const child of node.children) {
        nodes.push(...getAllNodes(child))
      }
    }
    return nodes
  }

  /**
   * 获取所有可见节点的扁平化列表
   */
  const getVisibleNodes = (node: MoteNode): MoteNode[] => {
    const nodes: MoteNode[] = [node]
    if (node.children && !node.collapsed) {
      for (const child of node.children) {
        nodes.push(...getVisibleNodes(child))
      }
    }
    return nodes
  }

  /**
   * 检查节点是否可见
   */
  const isNodeVisible = (nodeId: string, moteTree: MoteNode): boolean => {
    const visibleNodes = getVisibleNodes(moteTree)
    return visibleNodes.some((node) => node.id === nodeId)
  }

  /**
   * 查找上一个节点（包括不可见的）
   */
  const findPreviousNode = (nodeId: string, moteTree: MoteNode): MoteNode | null => {
    const allNodes = getAllNodes(moteTree)
    const currentIndex = allNodes.findIndex((node) => node.id === nodeId)
    return currentIndex > 0 ? allNodes[currentIndex - 1] : null
  }

  /**
   * 查找下一个节点（包括不可见的）
   */
  const findNextNode = (nodeId: string, moteTree: MoteNode): MoteNode | null => {
    const allNodes = getAllNodes(moteTree)
    const currentIndex = allNodes.findIndex((node) => node.id === nodeId)
    return currentIndex >= 0 && currentIndex < allNodes.length - 1
      ? allNodes[currentIndex + 1]
      : null
  }

  /**
   * 展开节点使其可见
   */
  const expandNodeToVisible = (nodeId: string, moteTree: MoteNode, toggleNodeCollapse: (nodeId: string) => void): void => {
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

    const targetNode = findNodeById(nodeId, moteTree)
    if (targetNode) {
      let currentId = targetNode.parentId
      while (currentId) {
        const parentNode = findNodeById(currentId, moteTree)
        if (parentNode && parentNode.collapsed) {
          toggleNodeCollapse(parentNode.id)
        }
        currentId = parentNode ? parentNode.parentId : ''
      }
    }
  }

  /**
   * 查找上一个可见节点（大纲笔记视图专用）
   */
  const findPreviousVisibleNode = (nodeId: string, moteTree: MoteNode, toggleNodeCollapse: (nodeId: string) => void): MoteNode | null => {
    if (!isNodeVisible(nodeId, moteTree)) {
      expandNodeToVisible(nodeId, moteTree, toggleNodeCollapse)
    }

    const visibleNodes = getVisibleNodes(moteTree)
    const currentIndex = visibleNodes.findIndex((node) => node.id === nodeId)
    return currentIndex > 0 ? visibleNodes[currentIndex - 1] : null
  }

  /**
   * 查找下一个可见节点（大纲笔记视图专用）
   */
  const findNextVisibleNode = (nodeId: string, moteTree: MoteNode, toggleNodeCollapse: (nodeId: string) => void): MoteNode | null => {
    if (!isNodeVisible(nodeId, moteTree)) {
      expandNodeToVisible(nodeId, moteTree, toggleNodeCollapse)
    }

    const visibleNodes = getVisibleNodes(moteTree)
    const currentIndex = visibleNodes.findIndex((node) => node.id === nodeId)
    return currentIndex >= 0 && currentIndex < visibleNodes.length - 1
      ? visibleNodes[currentIndex + 1]
      : null
  }

  return {
    findNodeText,
    findParentNode,
    findFirstChildNode,
    findSiblingNode,
    findNodeAndParent,
    getAllNodes,
    getVisibleNodes,
    isNodeVisible,
    findPreviousNode,
    findNextNode,
    expandNodeToVisible,
    findPreviousVisibleNode,
    findNextVisibleNode,
  }
})
