/**
 * 脑图节点状态管理 Store
 *
 * 负责管理脑图节点的状态判断和查询功能，包括：
 * - 节点查找和定位
 * - 节点状态判断（折叠、子节点等）
 * - 节点操作权限判断
 * - 节点层级关系分析
 *
 * @class useNodeStateStore
 * @example
 * const nodeStateStore = useNodeStateStore()
 * const hasChildren = nodeStateStore.hasChildren('nodeId', moteTree)
 * const canDelete = nodeStateStore.canDeleteNode('nodeId', 'rootId')
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

export const useNodeStateStore = defineStore('nodeStateStore', () => {
  // ==================== 节点状态判断 ====================

  /**
   * 根据ID递归查找节点
   *
   * 在脑图树中递归查找指定ID的节点，
   * 如果找不到则返回 null。
   *
   * @param {string} nodeId - 要查找的节点ID
   * @param {MoteNode} node - 开始查找的节点
   * @returns {MoteNode | null} 找到的节点或 null
   *
   * @example
   * const node = nodeStateStore.findNodeById('node123', moteTree)
   * if (node) {
   *   console.log('找到节点:', node.text)
   * }
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
   *
   * 同时查找指定节点及其父节点，
   * 用于需要操作父子关系的场景。
   *
   * @param {string} nodeId - 要查找的节点ID
   * @param {MoteNode} node - 开始查找的节点
   * @returns {Object} 包含节点和父节点的对象
   * @returns {MoteNode | null} returns.node - 找到的节点
   * @returns {MoteNode | null} returns.parent - 父节点
   *
   * @example
   * const { node, parent } = nodeStateStore.findNodeAndParent('node123', moteTree)
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
   * 判断节点是否有子节点
   *
   * 检查指定节点是否包含子节点。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否有子节点
   *
   * @example
   * const hasChildren = nodeStateStore.hasChildren('node123', moteTree)
   * if (hasChildren) {
   *   console.log('该节点有子节点')
   * }
   */
  const hasChildren = (nodeId: string, moteTree: MoteNode): boolean => {
    const node = findNodeById(nodeId, moteTree)
    return !!(node?.children && node.children.length > 0)
  }

  /**
   * 判断节点是否处于折叠状态
   *
   * 检查指定节点是否被折叠（隐藏子节点）。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否折叠
   *
   * @example
   * const isCollapsed = nodeStateStore.isNodeCollapsed('node123', moteTree)
   * if (isCollapsed) {
   *   console.log('节点已折叠')
   * }
   */
  const isNodeCollapsed = (nodeId: string, moteTree: MoteNode): boolean => {
    const node = findNodeById(nodeId, moteTree)
    return node?.collapsed || false
  }

  /**
   * 判断是否可以添加同级节点
   *
   * 检查是否可以在指定节点旁边添加同级节点，
   * 根节点不能添加同级节点。
   *
   * @param {string} nodeId - 节点ID
   * @param {string} rootNodeId - 根节点ID
   * @returns {boolean} 是否可以添加同级节点
   *
   * @example
   * const canAdd = nodeStateStore.canAddSibling('node123', 'rootId')
   * if (canAdd) {
   *   // 显示添加同级节点按钮
   * }
   */
  const canAddSibling = (nodeId: string, rootNodeId: string): boolean => {
    return nodeId !== rootNodeId
  }

  /**
   * 判断是否可以删除节点
   *
   * 检查是否可以删除指定节点，
   * 根节点不能被删除。
   *
   * @param {string} nodeId - 节点ID
   * @param {string} rootNodeId - 根节点ID
   * @returns {boolean} 是否可以删除节点
   *
   * @example
   * const canDelete = nodeStateStore.canDeleteNode('node123', 'rootId')
   * if (canDelete) {
   *   // 显示删除按钮
   * }
   */
  const canDeleteNode = (nodeId: string, rootNodeId: string): boolean => {
    return nodeId !== rootNodeId
  }

  /**
   * 判断节点是否可以升级（提升层级）
   *
   * 检查节点是否可以提升到更高的层级，
   * 根节点和根节点的直接子节点不能升级。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否可以升级
   *
   * @example
   * const canPromote = nodeStateStore.canProMoteNode('node123', moteTree)
   * if (canPromote) {
   *   // 显示升级按钮
   * }
   */
  const canProMoteNode = (nodeId: string, moteTree: MoteNode): boolean => {
    if (nodeId === moteTree.id) return false

    const { node, parent } = findNodeAndParent(nodeId, moteTree)
    if (!node || !parent) return false

    return parent.id !== moteTree.id
  }

  /**
   * 判断节点是否可以降级（降低层级）
   *
   * 检查节点是否可以降低到更低的层级，
   * 需要前面有同级节点才能降级。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否可以降级
   *
   * @example
   * const canDemote = nodeStateStore.canDeMoteNode('node123', moteTree)
   * if (canDemote) {
   *   // 显示降级按钮
   * }
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
   *
   * 检查节点是否可以在同级节点中向上移动，
   * 需要不是第一个子节点才能上移。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否可以上移
   *
   * @example
   * const canMoveUp = nodeStateStore.canMoveUp('node123', moteTree)
   * if (canMoveUp) {
   *   // 显示上移按钮
   * }
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
   *
   * 检查节点是否可以在同级节点中向下移动，
   * 需要不是最后一个子节点才能下移。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树
   * @returns {boolean} 是否可以下移
   *
   * @example
   * const canMoveDown = nodeStateStore.canMoveDown('node123', moteTree)
   * if (canMoveDown) {
   *   // 显示下移按钮
   * }
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
