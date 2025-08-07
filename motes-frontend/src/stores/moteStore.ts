import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMoteData, updateMoteData } from '@/services/moteApi'
import { message } from 'ant-design-vue'
import { useNodeStateStore } from './mote/nodeStateStore'
import { useNodeFinderStore } from './mote/nodeFinderStore'
import { useNodeOperationsStore } from './mote/nodeOperationsStore'
import { useKeyboardStore } from './mote/keyboardStore'
import { useImportExportStore } from './mote/importExportStore'

// ==================== 类型定义 ====================
interface MoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteNode[]
}

type ViewMode = 'map' | 'note'

export const useMoteStore = defineStore('moteStore', () => {
  // ==================== 状态管理 ====================

  // 视图状态
  const viewMode = ref<ViewMode>('map')

  // 文档状态
  const currentDocKey = ref('')
  const isDirty = ref(false)
  const moteTree = ref<MoteNode>({
    id: '',
    text: '',
    collapsed: false,
    parentId: '',
    children: []
  })

  // 标记是否已经初始化过
  const isInitialized = ref<boolean>(false)

  // 选中状态
  const selectedNodeId = ref('')
  const selectedNodeLabel = ref('')
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

  // 编辑状态
  const isEditing = ref(false)
  const editingNodeText = ref('')
  const originalText = ref('')

  // ==================== 子 Store 实例 ====================
  const nodeStateStore = useNodeStateStore()
  const nodeFinderStore = useNodeFinderStore()
  const nodeOperationsStore = useNodeOperationsStore()
  const keyboardStore = useKeyboardStore()
  const importExportStore = useImportExportStore()

  // ==================== 节点查找工具 ====================

  /**
   * 查找节点文本
   */
  const findNodeText = (data: MoteNode, targetId: string): string => {
    return nodeFinderStore.findNodeText(data, targetId)
  }

  /**
   * 查找父节点
   */
  const findParentNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findParentNode(nodeId, moteTree.value)
  }

  /**
   * 查找第一个子节点
   */
  const findFirstChildNode = (nodeId: string): MoteNode | null => {
    return nodeFinderStore.findFirstChildNode(nodeId, moteTree.value)
  }

  /**
   * 查找节点和其父节点
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
      message.error('加载脑图数据失败')
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
  }
})
