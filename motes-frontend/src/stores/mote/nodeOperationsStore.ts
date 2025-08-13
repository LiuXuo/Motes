/**
 * 脑图节点操作功能 Store
 *
 * 负责提供脑图节点的各种操作功能，包括：
 * - 节点的增删改查操作
 * - 节点层级关系的调整（升级、降级）
 * - 节点位置的移动（上移、下移）
 * - 节点折叠状态的切换
 * - 文档修改状态的标记
 * - 与节点状态 Store 的集成
 *
 * @class useNodeOperationsStore
 * @example
 * const nodeOperationsStore = useNodeOperationsStore()
 * const newNodeId = nodeOperationsStore.addChildNode('parentId', moteTree, isDirty)
 * nodeOperationsStore.editNodeText('nodeId', '新文本', moteTree, isDirty)
 */

import { defineStore } from 'pinia'
import { generateId } from '@/utils'

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

export const useNodeOperationsStore = defineStore('nodeOperationsStore', () => {
  // ==================== 节点操作工具 ====================

  /**
   * 从父节点中删除指定节点
   *
   * 从父节点的子节点数组中移除指定节点。
   *
   * @param {string} nodeId - 要删除的节点ID
   * @param {MoteNode} parent - 父节点
   * @returns {boolean} 删除是否成功
   *
   * @example
   * const success = nodeOperationsStore.removeNodeFromParent('nodeId', parentNode)
   * if (success) {
   *   console.log('节点已从父节点中删除')
   * }
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
   *
   * 将文档标记为已修改，用于触发自动保存。
   *
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.markAsDirty(isDirty)
   */
  const markAsDirty = (isDirty: { value: boolean }) => {
    isDirty.value = true
  }

  // ==================== 节点操作 ====================

  /**
   * 添加子节点
   *
   * 在指定父节点下添加新的子节点，
   * 如果父节点被折叠会自动展开。
   *
   * @param {string} parentId - 父节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   * @returns {string} 新创建的子节点ID
   *
   * @example
   * const newNodeId = nodeOperationsStore.addChildNode('parentId', moteTree, isDirty)
   * console.log('新子节点ID:', newNodeId)
   *
   * @throws {Error} 当父节点不存在时
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
   *
   * 在指定节点后面添加同级节点，
   * 新节点会插入到当前节点的下一个位置。
   *
   * @param {string} nodeId - 参考节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   * @returns {string} 新创建的同级节点ID
   *
   * @example
   * const newSiblingId = nodeOperationsStore.addSiblingNode('nodeId', moteTree, isDirty)
   * console.log('新同级节点ID:', newSiblingId)
   *
   * @throws {Error} 当参考节点不存在时
   * @throws {Error} 当尝试为根节点添加同级节点时
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
   *
   * 从脑图树中删除指定节点及其所有子节点。
   *
   * @param {string} nodeId - 要删除的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.deleteNode('nodeId', moteTree, isDirty)
   * console.log('节点已删除')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当尝试删除根节点时
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
   *
   * 切换指定节点的折叠状态，
   * 只有有子节点的节点才能被折叠。
   *
   * @param {string} nodeId - 节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   * @param {(nodeId: string, moteTree: MoteNode) => boolean} hasChildren - 检查是否有子节点的函数
   *
   * @example
   * nodeOperationsStore.toggleNodeCollapse('nodeId', moteTree, isDirty, hasChildren)
   * console.log('节点折叠状态已切换')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当叶子节点尝试折叠时
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
   *
   * 修改指定节点的文本内容。
   *
   * @param {string} nodeId - 节点ID
   * @param {string} newText - 新的文本内容
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.editNodeText('nodeId', '新文本内容', moteTree, isDirty)
   * console.log('节点文本已更新')
   *
   * @throws {Error} 当节点不存在时
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
   *
   * 将节点降级为前一个兄弟节点的子节点，
   * 需要前面有同级节点才能降级。
   *
   * @param {string} nodeId - 要降级的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.deMoteNode('nodeId', moteTree, isDirty)
   * console.log('节点已降级')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当尝试降级根节点时
   * @throws {Error} 当没有前一个兄弟节点时
   * @throws {Error} 当节点是第一个子节点时
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
   *
   * 将节点升级到祖父节点下，
   * 成为父节点的兄弟节点。
   *
   * @param {string} nodeId - 要升级的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.proMoteNode('nodeId', moteTree, isDirty)
   * console.log('节点已升级')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当尝试升级根节点时
   * @throws {Error} 当父节点是根节点时
   * @throws {Error} 当祖父节点不存在时
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
   *
   * 将节点在同级节点中向上移动一个位置。
   *
   * @param {string} nodeId - 要上移的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.moveNodeUp('nodeId', moteTree, isDirty)
   * console.log('节点已上移')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当尝试移动根节点时
   * @throws {Error} 当没有兄弟节点时
   * @throws {Error} 当节点是第一个子节点时
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
   *
   * 将节点在同级节点中向下移动一个位置。
   *
   * @param {string} nodeId - 要下移的节点ID
   * @param {MoteNode} moteTree - 脑图树数据
   * @param {{ value: boolean }} isDirty - 文档修改状态引用
   *
   * @example
   * nodeOperationsStore.moveNodeDown('nodeId', moteTree, isDirty)
   * console.log('节点已下移')
   *
   * @throws {Error} 当节点不存在时
   * @throws {Error} 当尝试移动根节点时
   * @throws {Error} 当没有兄弟节点时
   * @throws {Error} 当节点是最后一个子节点时
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
