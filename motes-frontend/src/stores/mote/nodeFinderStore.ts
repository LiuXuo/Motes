/**
 * 脑图节点查找功能 Store
 *
 * 负责提供脑图节点的查找和导航功能，包括：
 * - 节点文本查找
 * - 父子节点关系查找
 * - 兄弟节点查找
 * - 可见节点导航（支持折叠状态）
 * - 节点展开功能
 * - 支持思维导图和大纲笔记两种视图模式
 *
 * @class useNodeFinderStore
 * @example
 * const nodeFinderStore = useNodeFinderStore()
 * const text = nodeFinderStore.findNodeText(moteTree, 'nodeId')
 * const parent = nodeFinderStore.findParentNode('nodeId', moteTree)
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
 * 节点方向类型
 *
 * 定义查找兄弟节点的方向。
 *
 * @typedef {'prev' | 'next'} NodeDirection
 */
type NodeDirection = 'prev' | 'next'

export const useNodeFinderStore = defineStore('nodeFinderStore', () => {
  // ==================== 节点查找工具 ====================

  /**
   * 查找节点文本
   *
   * 根据节点ID在脑图树中递归查找对应的文本内容。
   *
   * @param {MoteNode} data - 脑图树数据
   * @param {string} targetId - 目标节点ID
   * @returns {string} 节点文本内容，找不到时返回空字符串
   *
   * @example
   * const text = nodeFinderStore.findNodeText(moteTree, 'node123')
   * console.log('节点文本:', text)
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
   *
   * 根据节点ID在脑图树中查找其父节点。
   *
   * @param {string} nodeId - 要查找父节点的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {MoteNode | null} 父节点，找不到时返回 null
   *
   * @example
   * const parent = nodeFinderStore.findParentNode('node123', moteTree)
   * if (parent) {
   *   console.log('父节点:', parent.text)
   * }
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
   *
   * 根据节点ID查找其第一个子节点。
   *
   * @param {string} nodeId - 父节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {MoteNode | null} 第一个子节点，没有子节点时返回 null
   *
   * @example
   * const firstChild = nodeFinderStore.findFirstChildNode('node123', moteTree)
   * if (firstChild) {
   *   console.log('第一个子节点:', firstChild.text)
   * }
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
   *
   * 同时查找指定节点及其父节点，用于需要操作父子关系的场景。
   *
   * @param {string} nodeId - 要查找的节点ID
   * @param {MoteNode} node - 开始查找的节点
   * @returns {Object} 包含节点和父节点的对象
   * @returns {MoteNode | null} returns.node - 找到的节点
   * @returns {MoteNode | null} returns.parent - 父节点
   *
   * @example
   * const { node, parent } = nodeFinderStore.findNodeAndParent('node123', moteTree)
   * if (node && parent) {
   *   console.log('节点:', node.text, '父节点:', parent.text)
   * }
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
   *
   * 根据方向查找指定节点的兄弟节点（上一个或下一个）。
   *
   * @param {string} nodeId - 当前节点ID
   * @param {NodeDirection} direction - 查找方向：'prev'（上一个）或 'next'（下一个）
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {MoteNode | null} 兄弟节点，找不到时返回 null
   *
   * @example
   * const prevSibling = nodeFinderStore.findSiblingNode('node123', 'prev', moteTree)
   * const nextSibling = nodeFinderStore.findSiblingNode('node123', 'next', moteTree)
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
   *
   * 递归遍历脑图树，返回所有节点的扁平化数组，
   * 包括被折叠隐藏的节点。
   *
   * @param {MoteNode} node - 开始遍历的节点
   * @returns {MoteNode[]} 所有节点的数组
   *
   * @example
   * const allNodes = nodeFinderStore.getAllNodes(moteTree)
   * console.log('总节点数:', allNodes.length)
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
   *
   * 递归遍历脑图树，返回所有可见节点的扁平化数组，
   * 被折叠的节点及其子节点不会包含在内。
   *
   * @param {MoteNode} node - 开始遍历的节点
   * @returns {MoteNode[]} 可见节点的数组
   *
   * @example
   * const visibleNodes = nodeFinderStore.getVisibleNodes(moteTree)
   * console.log('可见节点数:', visibleNodes.length)
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
   *
   * 判断指定节点在当前折叠状态下是否可见。
   *
   * @param {string} nodeId - 要检查的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {boolean} 节点是否可见
   *
   * @example
   * const isVisible = nodeFinderStore.isNodeVisible('node123', moteTree)
   * if (isVisible) {
   *   console.log('节点可见')
   * }
   */
  const isNodeVisible = (nodeId: string, moteTree: MoteNode): boolean => {
    const visibleNodes = getVisibleNodes(moteTree)
    return visibleNodes.some((node) => node.id === nodeId)
  }

  /**
   * 查找上一个节点（包括不可见的）
   *
   * 在所有节点中查找指定节点的上一个节点，
   * 不考虑折叠状态。
   *
   * @param {string} nodeId - 当前节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {MoteNode | null} 上一个节点，没有时返回 null
   *
   * @example
   * const prevNode = nodeFinderStore.findPreviousNode('node123', moteTree)
   * if (prevNode) {
   *   console.log('上一个节点:', prevNode.text)
   * }
   */
  const findPreviousNode = (nodeId: string, moteTree: MoteNode): MoteNode | null => {
    const allNodes = getAllNodes(moteTree)
    const currentIndex = allNodes.findIndex((node) => node.id === nodeId)
    return currentIndex > 0 ? allNodes[currentIndex - 1] : null
  }

  /**
   * 查找下一个节点（包括不可见的）
   *
   * 在所有节点中查找指定节点的下一个节点，
   * 不考虑折叠状态。
   *
   * @param {string} nodeId - 当前节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @returns {MoteNode | null} 下一个节点，没有时返回 null
   *
   * @example
   * const nextNode = nodeFinderStore.findNextNode('node123', moteTree)
   * if (nextNode) {
   *   console.log('下一个节点:', nextNode.text)
   * }
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
   *
   * 递归展开指定节点的所有父节点，
   * 确保该节点在视图中可见。
   *
   * @param {string} nodeId - 要展开的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {(nodeId: string) => void} toggleNodeCollapse - 切换节点折叠状态的函数
   *
   * @example
   * nodeFinderStore.expandNodeToVisible('node123', moteTree, toggleNodeCollapse)
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
   *
   * 在可见节点中查找指定节点的上一个节点，
   * 如果节点不可见会自动展开使其可见。
   *
   * @param {string} nodeId - 当前节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {(nodeId: string) => void} toggleNodeCollapse - 切换节点折叠状态的函数
   * @returns {MoteNode | null} 上一个可见节点，没有时返回 null
   *
   * @example
   * const prevVisible = nodeFinderStore.findPreviousVisibleNode('node123', moteTree, toggleNodeCollapse)
   * if (prevVisible) {
   *   console.log('上一个可见节点:', prevVisible.text)
   * }
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
   *
   * 在可见节点中查找指定节点的下一个节点，
   * 如果节点不可见会自动展开使其可见。
   *
   * @param {string} nodeId - 当前节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {(nodeId: string) => void} toggleNodeCollapse - 切换节点折叠状态的函数
   * @returns {MoteNode | null} 下一个可见节点，没有时返回 null
   *
   * @example
   * const nextVisible = nodeFinderStore.findNextVisibleNode('node123', moteTree, toggleNodeCollapse)
   * if (nextVisible) {
   *   console.log('下一个可见节点:', nextVisible.text)
   * }
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
