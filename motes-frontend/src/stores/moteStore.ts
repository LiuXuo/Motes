/**
 * 脑图笔记核心状态管理 Store
 *
 * 负责管理脑图笔记的核心状态和功能，包括：
 * - 脑图树数据结构和状态管理
 * - 视图模式切换（思维导图/大纲笔记）
 * - 节点选中和编辑状态
 * - 文档保存和加载
 * - 与子 Store 的协调和集成
 * - 自动保存功能
 * - 键盘快捷键处理
 *
 * @class useMoteStore
 * @example
 * const moteStore = useMoteStore()
 * await moteStore.loadDocument('doc123')
 * moteStore.setViewMode('map')
 * const success = await moteStore.saveDocument()
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMoteData, updateMoteData } from '@/services/moteApi'
import { useNodeStateStore } from './mote/nodeStateStore'
import { useNodeFinderStore } from './mote/nodeFinderStore'
import { useNodeOperationsStore } from './mote/nodeOperationsStore'
import { useKeyboardStore } from './mote/keyboardStore'
import { useImportExportStore } from './mote/importExportStore'
import { useAiStore } from './aiStore'

// ==================== 类型定义 ====================

/**
 * 脑图节点接口
 *
 * 定义脑图树中每个节点的数据结构，
 * 支持层级关系和折叠状态。
 *
 * @interface MoteNode
 */
export interface MoteNode {
  /** 节点唯一标识符 */
  id: string
  /** 节点文本内容 */
  text: string
  /** 节点是否折叠（隐藏子节点） */
  collapsed: boolean
  /** 父节点ID，根节点为空字符串 */
  parentId: string
  /** 子节点数组，可选 */
  children?: MoteNode[]
}

/**
 * 视图模式类型
 *
 * 定义脑图笔记的显示模式：
 * - map: 思维导图视图
 * - note: 大纲笔记视图
 *
 * @typedef {'map' | 'note'} ViewMode
 */
export type ViewMode = 'map' | 'note'

export const useMoteStore = defineStore('moteStore', () => {
  // ==================== 状态管理 ====================

  /** 当前视图模式：思维导图或大纲笔记 */
  const viewMode = ref<ViewMode>('map')

  /** 当前文档的唯一标识符 */
  const currentDocKey = ref('')

  /** 文档是否有未保存的修改 */
  const isDirty = ref(false)

  /** 脑图树数据结构 */
  const moteTree = ref<MoteNode>({
    id: '',
    text: '',
    collapsed: false,
    parentId: '',
    children: []
  })

  /** 标记是否已经初始化过 */
  const isInitialized = ref<boolean>(false)

  /** 当前选中节点的ID */
  const selectedNodeId = ref('')

  /** 当前选中节点的标签文本 */
  const selectedNodeLabel = ref('')

  /** 选中节点的计算属性，支持读写 */
  const selectedNode = computed({
    get: () => ({
      id: selectedNodeId.value,
      label: selectedNodeLabel.value,
    }),
    set: (value: { id: string; label: string }) => {
      selectedNodeId.value = value.id
      selectedNodeLabel.value = value.label
    },
  })

  /** 是否正在编辑节点 */
  const isEditing = ref(false)

  /** 正在编辑的节点文本 */
  const editingNodeText = ref('')

  /** 编辑前的原始文本，用于取消编辑时恢复 */
  const originalText = ref('')

  // ==================== 子 Store 实例 ====================

  /** 节点状态管理 Store */
  const nodeStateStore = useNodeStateStore()

  /** 节点查找功能 Store */
  const nodeFinderStore = useNodeFinderStore()

  /** 节点操作功能 Store */
  const nodeOperationsStore = useNodeOperationsStore()

  /** 键盘事件处理 Store */
  const keyboardStore = useKeyboardStore()

  /** 导入导出功能 Store */
  const importExportStore = useImportExportStore()

  /** AI 功能 Store */
  const aiStore = useAiStore()

  // ==================== 节点查找工具 ====================

  /**
   * 查找节点文本
   *
   * 根据节点ID在脑图树中查找对应的文本内容。
   *
   * @param {MoteNode} data - 脑图树数据
   * @param {string} targetId - 目标节点ID
   * @returns {string} 节点文本内容
   *
   * @example
   * const text = moteStore.findNodeText(moteTree, 'node123')
   * console.log('节点文本:', text)
   */
  const findNodeText = (data: MoteNode, targetId: string): string => {
    return nodeFinderStore.findNodeText(data, targetId)
  }

  /**
   * 查找父节点
   *
   * 根据节点ID查找其父节点。
   *
   * @param {string} nodeId - 节点ID
   * @returns {MoteNode | null} 父节点或 null
   *
   * @example
   * const parent = moteStore.findParentNode('node123')
   * if (parent) {
   *   console.log('父节点:', parent.text)
   * }
   */
  const findParentNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findParentNode(nodeId, moteTree.value)
  }

  /**
   * 查找第一个子节点
   *
   * 根据节点ID查找其第一个子节点。
   *
   * @param {string} nodeId - 节点ID
   * @returns {MoteNode | null} 第一个子节点或 null
   *
   * @example
   * const firstChild = moteStore.findFirstChildNode('node123')
   * if (firstChild) {
   *   console.log('第一个子节点:', firstChild.text)
   * }
   */
  const findFirstChildNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findFirstChildNode(nodeId, moteTree.value)
  }

  /**
   * 查找节点和其父节点
   *
   * 同时查找指定节点及其父节点。
   *
   * @param {string} nodeId - 节点ID
   * @returns {Object} 包含节点和父节点的对象
   * @returns {MoteNode | null} returns.node - 找到的节点
   * @returns {MoteNode | null} returns.parent - 父节点
   *
   * @example
   * const { node, parent } = moteStore.findNodeAndParent('node123')
   * if (node && parent) {
   *   console.log('节点:', node.text, '父节点:', parent.text)
   * }
   */
  const findNodeAndParent = (nodeId: string): { node: MoteNode | null; parent: MoteNode | null } => {
    return nodeFinderStore.findNodeAndParent(nodeId, moteTree.value)
  }

  /**
   * 查找兄弟节点
   */
  const findSiblingNode = (nodeId: string, direction: 'prev' | 'next'): MoteNode | null => {
    return nodeFinderStore.findSiblingNode(nodeId, direction, moteTree.value)
  }

  // ==================== 节点导航工具 ====================

  /**
   * 获取所有节点的扁平化列表（包括被折叠的）
   */
  const getAllNodes = (node: MoteNode): MoteNode[] => {
    return nodeFinderStore.getAllNodes(node)
  }

  /**
   * 获取所有可见节点的扁平化列表
   */
  const getVisibleNodes = (node: MoteNode): MoteNode[] => {
    return nodeFinderStore.getVisibleNodes(node)
  }

  /**
   * 检查节点是否可见
   */
  const isNodeVisible = (nodeId: string): boolean => {
    return nodeFinderStore.isNodeVisible(nodeId, moteTree.value)
  }

  /**
   * 查找上一个节点（包括不可见的）
   */
  const findPreviousNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findPreviousNode(nodeId, moteTree.value)
  }

  /**
   * 查找下一个节点（包括不可见的）
   */
  const findNextNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findNextNode(nodeId, moteTree.value)
  }

  /**
   * 展开节点使其可见
   */
  const expandNodeToVisible = (nodeId: string): void => {
    nodeFinderStore.expandNodeToVisible(nodeId, moteTree.value, toggleNodeCollapse)
  }

  /**
   * 查找上一个可见节点（大纲笔记视图专用）
   */
  const findPreviousVisibleNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findPreviousVisibleNode(nodeId, moteTree.value, toggleNodeCollapse)
  }

  /**
   * 查找下一个可见节点（大纲笔记视图专用）
   */
  const findNextVisibleNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findNextVisibleNode(nodeId, moteTree.value, toggleNodeCollapse)
  }

  // ==================== 节点状态判断 ====================

  /**
   * 判断节点是否有子节点
   */
  const hasChildren = (nodeId: string): boolean => {
    return nodeStateStore.hasChildren(nodeId, moteTree.value)
  }

  /**
   * 判断节点是否处于折叠状态
   */
  const isNodeCollapsed = (nodeId: string): boolean => {
    return nodeStateStore.isNodeCollapsed(nodeId, moteTree.value)
  }

  /**
   * 判断是否可以添加同级节点
   */
  const canAddSibling = (nodeId: string): boolean => {
    return nodeStateStore.canAddSibling(nodeId, moteTree.value.id)
  }

  /**
   * 判断是否可以删除节点
   */
  const canDeleteNode = (nodeId: string): boolean => {
    return nodeStateStore.canDeleteNode(nodeId, moteTree.value.id)
  }

  /**
   * 判断节点是否可以升级（提升层级）
   */
  const canProMoteNode = (nodeId: string): boolean => {
    return nodeStateStore.canProMoteNode(nodeId, moteTree.value)
  }

  /**
   * 判断节点是否可以降级（降低层级）
   */
  const canDeMoteNode = (nodeId: string): boolean => {
    return nodeStateStore.canDeMoteNode(nodeId, moteTree.value)
  }

  /**
   * 判断节点是否可以上移
   */
  const canMoveUp = (nodeId: string): boolean => {
    return nodeStateStore.canMoveUp(nodeId, moteTree.value)
  }

  /**
   * 判断节点是否可以下移
   */
  const canMoveDown = (nodeId: string): boolean => {
    return nodeStateStore.canMoveDown(nodeId, moteTree.value)
  }

  // ==================== 节点操作 ====================

  /**
   * 添加子节点
   */
  const addChildNode = (parentId: string): string => {
    return nodeOperationsStore.addChildNode(parentId, moteTree.value, isDirty)
  }

  /**
   * 添加同级节点
   */
  const addSiblingNode = (nodeId: string): string => {
    return nodeOperationsStore.addSiblingNode(nodeId, moteTree.value, isDirty)
  }

  /**
   * 删除节点
   */
  const deleteNode = (nodeId: string): void => {
    nodeOperationsStore.deleteNode(nodeId, moteTree.value, isDirty)
  }

  /**
   * 切换节点的折叠/展开状态
   */
  const toggleNodeCollapse = (nodeId: string): void => {
    nodeOperationsStore.toggleNodeCollapse(nodeId, moteTree.value, isDirty, hasChildren)
  }

  /**
   * 编辑节点文本内容
   */
  const editNodeText = (nodeId: string, newText: string): void => {
    nodeOperationsStore.editNodeText(nodeId, newText, moteTree.value, isDirty)
  }

  /**
   * 节点降级（降低层级）
   */
  const deMoteNode = (nodeId: string): void => {
    nodeOperationsStore.deMoteNode(nodeId, moteTree.value, isDirty)
  }

  /**
   * 节点升级（提升层级）
   */
  const proMoteNode = (nodeId: string): void => {
    nodeOperationsStore.proMoteNode(nodeId, moteTree.value, isDirty)
  }

  /**
   * 节点上移（在同层级中向上移动）
   */
  const moveNodeUp = (nodeId: string): void => {
    nodeOperationsStore.moveNodeUp(nodeId, moteTree.value, isDirty)
  }

  /**
   * 节点下移（在同层级中向下移动）
   */
  const moveNodeDown = (nodeId: string): void => {
    nodeOperationsStore.moveNodeDown(nodeId, moteTree.value, isDirty)
  }

  // ==================== 选中状态管理 ====================

  /**
   * 重置编辑状态
   */
  const resetEditingState = () => {
    isEditing.value = false
    editingNodeText.value = ''
  }

  /**
   * 选中指定节点
   */
  const selectNode = (nodeId: string) => {
    if (!nodeId) {
      selectedNode.value = { id: '', label: '' }
      return
    }

    const latestText = findNodeText(moteTree.value, nodeId)
    selectedNode.value = {
      id: nodeId,
      label: latestText || '',
    }
  }

  /**
   * 清除选中状态
   */
  const clearSelection = () => {
    resetEditingState()
    selectedNode.value = { id: '', label: '' }
  }

  // ==================== 编辑功能 ====================

  /**
   * 开始编辑节点文本
   */
  const startEditing = () => {
    isEditing.value = true
    originalText.value = selectedNodeLabel.value
    if (!editingNodeText.value) {
      editingNodeText.value = selectedNodeLabel.value
    }
  }

  /**
   * 处理文本确认
   */
  const handleTextConfirm = () => {
    let newText = editingNodeText.value.trim()

    if (!newText && selectedNodeLabel.value) {
      newText = selectedNodeLabel.value.trim()
    }

    if (!newText) {
      editingNodeText.value = originalText.value
      isEditing.value = false
      return
    }

    if (newText.length > 100) {
      alert('节点名称不能超过100个字符')
      editingNodeText.value = originalText.value
      isEditing.value = false
      return
    }

    try {
      editNodeText(selectedNodeId.value, newText)
      selectedNodeLabel.value = newText
    } catch (error) {
      console.error('编辑节点失败:', error)
      alert(error instanceof Error ? error.message : '编辑节点失败')
      editingNodeText.value = originalText.value
    }

    isEditing.value = false
    setTimeout(() => {
      editingNodeText.value = ''
    }, 100)
  }

    // ==================== 快捷键管理 ====================

  /**
   * 创建快捷键处理器
   */
  const createKeyboardHandler = (isEditing: boolean, viewMode: ViewMode = 'map') => {
    return keyboardStore.createKeyboardHandler(
      isEditing,
      viewMode,
      selectedNodeId.value,
      moteTree.value,
      {
        resetEditingState,
        clearSelection,
        startEditing,
        handleTextConfirm,
        selectNode,
        addChildNode,
        addSiblingNode,
        deleteNode,
        toggleNodeCollapse,
        proMoteNode,
        deMoteNode,
        moveNodeUp,
        moveNodeDown,
        findParentNode,
        findFirstChildNode,
        findSiblingNode,
        findPreviousVisibleNode,
        findNextVisibleNode,
        hasChildren,
        canAddSibling,
        canDeleteNode,
        canProMoteNode,
        canDeMoteNode,
        canMoveUp,
        canMoveDown,
        findPreviousNode,
        isAiExpanding: aiStore.isAiExpanding,
        openAiExpandModal: aiStore.openAiExpandModal,
      }
    )
  }

  // ==================== 数据管理 ====================

  /**
   * 加载脑图笔记数据
   */
  const loadMoteData = async (docKey: string): Promise<boolean> => {
    try {
      if (!docKey) {
        console.error('文档key不能为空')
        return false
      }

      const response = await getMoteData(docKey)

      if (response.success && response.data) {
        currentDocKey.value = docKey
        moteTree.value = response.data.moteTree
        isDirty.value = false
        isInitialized.value = true

        clearSelection()

        if (moteTree.value && moteTree.value.id) {
          selectNode(moteTree.value.id)
        }

        return true
      } else {
        console.error('加载脑图数据失败:', response.error)
        // 重置为默认状态
        resetMoteTree()
        return false
      }
    } catch (error: any) {
      console.error('加载脑图数据错误:', error)

      if (error.response?.status === 404) {
        const notFoundError = new Error('NOT_FOUND')
        notFoundError.name = 'NOT_FOUND'
        notFoundError.message = error.response?.data?.error?.message || '脑图笔记不存在'
        throw notFoundError
      }

      // 发生错误时重置为默认状态
      resetMoteTree()
      console.error('加载脑图数据失败')
      return false
    }
  }

  /**
   * 保存文档到后端
   */
  const saveDocument = async (): Promise<boolean> => {
    try {
      if (!currentDocKey.value) {
        console.error('当前文档key不能为空')
        return false
      }

      const response = await updateMoteData(currentDocKey.value, moteTree.value)

      if (response.success) {
        isDirty.value = false
        return true
      } else {
        console.error('保存失败:', response.error)
        return false
      }
    } catch (error) {
      console.error('保存文档错误:', error)
      return false
    }
  }

  /**
   * 重置脑图树
   */
  const resetMoteTree = () => {
    moteTree.value = {
      id: '',
      text: '',
      collapsed: false,
      parentId: '',
      children: []
    }
    isInitialized.value = false
  }

    // ==================== 导入导出功能 ====================

  /**
   * 导入文档
   */
  const importDocument = async (parentKey: string, file: File, format: 'json' | 'markdown' = 'json'): Promise<boolean> => {
    return importExportStore.importDocument(parentKey, file, format)
  }

  /**
   * 导出当前文档
   */
  const exportCurrentDocument = async (format: 'json' | 'markdown' = 'json'): Promise<boolean> => {
    return importExportStore.exportCurrentDocument(currentDocKey.value, format)
  }

  // ==================== AI生枝功能 ====================

  /**
   * 将扩展的节点添加到原树中
   */
  const addExpandedNodeToTree = (parentNodeId: string, expandedNode: any) => {
    const parentNode = findNodeById(moteTree.value, parentNodeId);
    if (parentNode && expandedNode.children) {
      // 为每个新节点生成ID并设置parentId
      const processedChildren = processExpandedNodes(expandedNode.children, parentNodeId);
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(...processedChildren);
      isDirty.value = true;
    }
  };

  /**
   * 处理扩展节点，生成ID等
   */
  const processExpandedNodes = (nodes: any[], parentId: string): MoteNode[] => {
    return nodes.map(node => {
      const nodeId = generateId();
      return {
        id: nodeId,
        text: node.text,
        collapsed: false,
        parentId,
        children: node.children ? processExpandedNodes(node.children, nodeId) : []
      };
    });
  };

  /**
   * 根据ID查找节点
   */
  const findNodeById = (node: MoteNode, targetId: string): MoteNode | null => {
    if (node.id === targetId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  // ==================== 返回接口 ====================
  return {
    // 状态
    viewMode,
    moteTree,
    isDirty,
    currentDocKey,
    selectedNodeId,
    selectedNodeLabel,
    selectedNode,
    isEditing,
    editingNodeText,
    originalText,
    isInitialized,

    // 节点查找工具
    findNodeText,
    findParentNode,
    findFirstChildNode,
    findSiblingNode,
    findNodeAndParent,

    // 节点导航
    getAllNodes,
    getVisibleNodes,
    isNodeVisible,
    findPreviousNode,
    findNextNode,
    expandNodeToVisible,
    findPreviousVisibleNode,
    findNextVisibleNode,

    // 状态管理
    resetEditingState,
    selectNode,
    clearSelection,

    // 节点操作
    addChildNode,
    addSiblingNode,
    deleteNode,
    toggleNodeCollapse,
    editNodeText,
    deMoteNode,
    proMoteNode,
    moveNodeUp,
    moveNodeDown,

    // 状态判断
    hasChildren,
    isNodeCollapsed,
    canAddSibling,
    canDeleteNode,
    canProMoteNode,
    canDeMoteNode,
    canMoveUp,
    canMoveDown,

    // 编辑功能
    startEditing,
    handleTextConfirm,

    // 快捷键管理
    createKeyboardHandler,

    // 数据管理
    loadMoteData,
    saveDocument,
    resetMoteTree,

    // 导入导出
    importDocument,
    exportCurrentDocument,

    // AI生枝辅助方法
    addExpandedNodeToTree,

  }
})
