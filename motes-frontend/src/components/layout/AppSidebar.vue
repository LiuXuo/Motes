<template>
  <a-layout-sider
    v-model:collapsed="collapsedValue"
    theme="light"
    collapsible
    :width="sidebarWidth"
    :style="{ position: 'relative' }"
    :class="{ dragging: isDragging }"
  >
    <div class="logo" :class="{ 'logo-collapsed': collapsedValue }" @click="goToHome" />
    <div class="sider-scroll">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        class="sidebar-menu"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="ai">
          <RobotOutlined />
          <span class="menu-title">AI 生成</span>
        </a-menu-item>
        <a-sub-menu key="documents">
          <template #title>
            <span @click.stop="handleDocumentsClick">
              <folder-outlined />
              <span class="menu-title">我的文档</span>
            </span>
          </template>

          <div class="search-container">
            <a-input-search v-model:value="searchValue" class="search-input" placeholder="搜索" />
            <a-dropdown :trigger="['click', 'contextmenu']">
              <a-button type="text" class="add-button">
                <PlusOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="handleAddMenuClick">
                  <a-menu-item key="new-mote">
                    <FileMarkdownOutlined />
                    新建文档
                  </a-menu-item>
                  <a-menu-item key="new-folder">
                    <FolderOpenOutlined />
                    新建文件夹
                  </a-menu-item>
                  <a-sub-menu key="import">
                    <template #title>
                      <ImportOutlined />
                      导入文档
                    </template>
                    <a-menu-item key="import-json">
                      <FileTextOutlined />
                      JSON格式
                    </a-menu-item>
                    <a-menu-item key="import-markdown">
                      <FileMarkdownOutlined />
                      Markdown格式
                    </a-menu-item>
                  </a-sub-menu>
                  <a-sub-menu v-if="isMoteRoute" key="export">
                    <template #title>
                      <ExportOutlined />
                      导出文档
                    </template>
                    <a-menu-item key="export-json">
                      <FileTextOutlined />
                      JSON格式
                    </a-menu-item>
                    <a-menu-item key="export-markdown">
                      <FileMarkdownOutlined />
                      Markdown格式
                    </a-menu-item>
                  </a-sub-menu>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <a-tree
            :show-line="true"
            :show-icon="true"
            :default-expand-all="true"
            :selected-keys="selectedKeys"
            :tree-data="filteredDocuments"
            draggable
            block-node
            class="document-tree"
            @select="onSelect"
            @drop="onDrop"
          >
            <template #icon="{ dataRef }">
              <FolderOpenOutlined
                v-if="
                  dataRef.type === 'folder' && (!dataRef.children || dataRef.children.length === 0)
                "
              />
              <FileMarkdownOutlined v-else-if="dataRef.type === 'mote'" />
            </template>
            <template #switcherIcon="{ expanded }">
              <CaretRightOutlined v-if="!expanded" />
              <CaretDownOutlined v-else />
            </template>
            <template #title="{ dataRef }">
              <DocContextMenu
                :node-type="dataRef.type"
                :context-type="'normal'"
                @menu-click="(nodeKey: string, menuKey: string) => onContextMenuClick(dataRef.key, menuKey, dataRef)"
              >
                <span v-if="searchValue && dataRef.title.indexOf(searchValue) > -1">
                  {{ dataRef.title.substring(0, dataRef.title.indexOf(searchValue)) }}
                  <span class="highlight-text">{{ searchValue }}</span>
                  {{
                    dataRef.title.substring(dataRef.title.indexOf(searchValue) + searchValue.length)
                  }}
                </span>
                <span v-else>{{ dataRef.title }}</span>
              </DocContextMenu>
            </template>
          </a-tree>

        </a-sub-menu>
        <a-menu-item key="trash">
          <delete-outlined />
          <span class="menu-title">回收站</span>
        </a-menu-item>
      </a-menu>
    </div>

    <div v-if="!collapsedValue" class="resize-handle" @mousedown="startResize"></div>
  </a-layout-sider>

  <!-- 选择目标文件夹（用于移动） -->
  <DocTreeModal
    v-model:open="moveModalOpen"
    title="选择目标文件夹"
    okText="移动到此处"
    :confirmLoading="docStore.isLoading"
    :excludeSubtreeRootKey="movingNodeKey || undefined"
    @confirm="handleMoveConfirm"
  />

  <!-- 重命名对话框 -->
  <a-modal
    v-model:open="renameModalVisible"
    :title="renameModalTitle"
    @ok="handleRenameConfirm"
    @cancel="handleRenameCancel"
    :confirm-loading="docStore.isLoading"
    :z-index="1000"
    :mask-closable="false"
  >
    <a-input
      v-model:value="renameModalValue"
      placeholder="请输入新名称"
      @keyup.enter="handleRenameConfirm"
      ref="renameInputRef"
    />
  </a-modal>

  <!-- 隐藏的文件输入框 -->
  <input
    ref="fileInputRef"
    type="file"
    accept=".json,.md,.markdown"
    style="display: none"
    @change="handleFileChange"
  />
</template>

<script setup lang="ts">
// ==================== 导入 ====================
import {
  FolderOutlined,
  DeleteOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  FileMarkdownOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import { ref, watch, computed, onUnmounted,  nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { AntTreeNodeDropEvent } from 'ant-design-vue/es/tree'
import { useDocStore, type DocNode } from '@/stores/docStore'
import { useMoteStore } from '@/stores/moteStore'
import { message } from 'ant-design-vue'
import DocContextMenu from './DocContextMenu.vue'
import DocTreeModal from './DocTreeModal.vue'

// ==================== 接口定义 ====================
interface Props {
  collapsed?: boolean
}

interface Emits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'drop', info: AntTreeNodeDropEvent): void
}

// ==================== 状态管理 ====================
const docStore = useDocStore()
const moteStore = useMoteStore()
const { fetchDocTree, createNode, renameNode, deleteNode, moveNode, duplicateNode } = docStore

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<Emits>()

// 侧边栏状态
const sidebarWidth = ref(270)
const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// 拖拽相关状态
const moveDebounceTimer = ref<number | null>(null)

const collapsedValue = computed({
  get() {
    return props.collapsed
  },
  set(value: boolean) {
    emit('update:collapsed', value)
    if (!value && sidebarWidth.value <= 200) {
      sidebarWidth.value = 270
    }
  },
})

// 菜单状态
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>(['documents'])

// 搜索状态
const searchValue = ref('')

// 右键菜单状态
const contextMenuVisible = ref(false)

// 重命名对话框状态
const renameModalVisible = ref(false)
const renameModalTitle = ref('')
const renameModalValue = ref('')
const renameModalTarget = ref<DocNode | null>(null)
const renameInputRef = ref<HTMLInputElement>()

// 文件导入相关状态
const fileInputRef = ref<HTMLInputElement>()
const importFormat = ref<'json' | 'markdown'>('json')
const importParentKey = ref<string>('')

// 移动对话框状态
const moveModalOpen = ref(false)
const movingNodeKey = ref<string | null>(null)

// ==================== 计算属性 ====================
const filteredDocuments = computed(() => {
  function filterDeletedNodes(nodes: DocNode[]): DocNode[] {
    return nodes
      .filter((node) => !node.isDeleted)
      .map((node) => ({
        ...node,
        children: node.children ? filterDeletedNodes(node.children) : undefined,
      }))
  }
  return filterDeletedNodes(docStore.docTree.children || [])
})

// 判断是否在mote路由下
const isMoteRoute = computed(() => {
  const currentRoute = router.currentRoute.value
  return currentRoute.path.startsWith('/mote/')
})

// ==================== 事件处理 ====================
function onSelect(
  selectedKeys: string[],
  info: { selected: boolean; selectedNodes: DocNode[]; node: DocNode; event: Event },
) {
  // 如果选中的是文件夹，导航到文件夹页面
  if (info.node.type === 'folder') {
    router.push(`/folder/${info.node.key}`)
  } else if (info.node.type === 'mote') {
    // 如果选中的是文档，导航到脑图笔记页面
    router.push(`/mote/${info.node.key}`)
  }
}

async function onContextMenuClick(treeKey: string, menuKey: string | number, targetNode: DocNode) {
  contextMenuVisible.value = false

  try {
    switch (String(menuKey)) {
      case 'new-folder':
        await handleCreateNode('folder', targetNode.key)
        break
      case 'new-mote':
        await handleCreateNode('mote', targetNode.key)
        break
      case 'duplicate':
        await handleDuplicateNode(targetNode)
        break
      case 'rename':
        showRenameModal(targetNode)
        break
      case 'delete':
        await handleDeleteNode(targetNode.key)
        break
      case 'move':
        movingNodeKey.value = targetNode.key
        moveModalOpen.value = true
        break
      default:
        break
    }
  } catch {
    message.error('操作失败')
  }
}

async function handleCreateNode(type: 'folder' | 'mote', parentKey: string) {
  const title = type === 'folder' ? '新建文件夹' : '新建文档'

  try {
    const result = await createNode(title, type, parentKey)
    if (result.success) {
      message.success(`${type === 'folder' ? '文件夹' : '文档'}创建成功`)
    } else {
      message.error(result.error?.message || '创建失败')
    }
  } catch {
    message.error('创建失败')
  }
}

async function handleMoveConfirm(folderKey: string) {
  if (!movingNodeKey.value) return
  try {
    const result = await moveNode(movingNodeKey.value, folderKey)
    if (result.success) {
      message.success('移动成功')
    } else {
      message.error(result.error?.message || '移动失败')
    }
  } catch {
    message.error('移动失败')
  } finally {
    moveModalOpen.value = false
    movingNodeKey.value = null
  }
}

async function handleDuplicateNode(node: DocNode) {
  try {
    const result = await duplicateNode(node.key)
    if (result.success) {
      message.success('副本创建成功')
    } else {
      message.error(result.error?.message || '创建副本失败')
    }
  } catch {
    message.error('创建副本失败')
  }
}

function showRenameModal(node: DocNode) {
  renameModalTarget.value = node
  renameModalTitle.value = `重命名${node.type === 'folder' ? '文件夹' : '文档'}`
  renameModalValue.value = node.title
  renameModalVisible.value = true
  // 在下一个tick中聚焦输入框
  nextTick(() => {
    if (renameInputRef.value) {
      renameInputRef.value.focus()
      renameInputRef.value.select()
    }
  })
}

async function handleRenameConfirm() {
  if (!renameModalTarget.value || !renameModalValue.value.trim()) {
    return
  }

  const newTitle = renameModalValue.value.trim()
  if (newTitle === renameModalTarget.value.title) {
    renameModalVisible.value = false
    return
  }

  try {
    const result = await renameNode(renameModalTarget.value.key, newTitle)
    if (result.success) {
      message.success('重命名成功')
      renameModalVisible.value = false
      // 清空状态
      renameModalTarget.value = null
      renameModalValue.value = ''
    } else {
      message.error(result.error?.message || '重命名失败')
    }
  } catch {
    message.error('重命名失败')
  }
}

function handleRenameCancel() {
  renameModalVisible.value = false
  renameModalTarget.value = null
  renameModalValue.value = ''
}

// ==================== 导入导出功能 ====================
function triggerFileImport() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const success = await moteStore.importDocument(importParentKey.value, file, importFormat.value)

    if (success) {
      // 刷新文档树
      await fetchDocTree()
    }
  } catch {
    message.error('文件导入失败，请检查文件格式')
  } finally {
    // 清空文件输入框
    if (target) {
      target.value = ''
    }
  }
}

async function handleDeleteNode(key: string) {
  try {
    const result = await deleteNode(key)
    if (result.success) {
      message.success('删除成功')
      // 从选中状态中移除
      selectedKeys.value = selectedKeys.value.filter(k => k !== key)
    } else {
      message.error(result.error?.message || '删除失败')
    }
  } catch {
    message.error('删除失败')
  }
}

async function handleAddMenuClick(e: { key: string }) {
  // 检查文档树是否已加载
  if (docStore.isLoading) {
    message.warning('文档树正在加载中，请稍后再试')
    return
  }

  // 检查是否已初始化
  if (!docStore.isInitialized) {
    try {
      const result = await fetchDocTree()
      if (!result.success) {
        message.error('无法获取文档树，请刷新页面重试')
        return
      }
    } catch {
      message.error('无法获取文档树，请刷新页面重试')
      return
    }
  }

  // 在根目录创建，使用文档树的根节点key
  const rootKey = docStore.docTree.key

  // 如果根节点key为空，尝试重新获取文档树
  if (!rootKey) {
    try {
      const result = await fetchDocTree()
      if (result.success && docStore.docTree.key) {
        // 重新尝试创建
        if (e.key === 'new-mote') {
          handleCreateNode('mote', docStore.docTree.key)
        } else if (e.key === 'new-folder') {
          handleCreateNode('folder', docStore.docTree.key)
        }
      } else {
        message.error('无法获取根节点，请刷新页面重试')
      }
  } catch {
      message.error('无法获取根节点，请刷新页面重试')
    }
    return
  }

  if (e.key === 'new-mote') {
    handleCreateNode('mote', rootKey)
  } else if (e.key === 'new-folder') {
    handleCreateNode('folder', rootKey)
  } else if (e.key === 'import-json') {
    importFormat.value = 'json'
    importParentKey.value = rootKey
    triggerFileImport()
  } else if (e.key === 'import-markdown') {
    importFormat.value = 'markdown'
    importParentKey.value = rootKey
    triggerFileImport()
  } else if (e.key === 'export-json') {
    await moteStore.exportCurrentDocument('json')
  } else if (e.key === 'export-markdown') {
    await moteStore.exportCurrentDocument('markdown')
  }
}

const router = useRouter()

// 根据路由更新选中状态
const updateSelectedKeys = () => {
  const currentRoute = router.currentRoute.value
  const path = currentRoute.path

  if (path === '/documents') {
    selectedKeys.value = ['documents']
  } else if (path === '/ai') {
    selectedKeys.value = ['ai']
  } else if (path.startsWith('/folder/')) {
    const folderId = currentRoute.params.folderId as string
    selectedKeys.value = [folderId]
  } else if (path.startsWith('/mote/')) {
    const moteId = currentRoute.params.moteId as string
    selectedKeys.value = [moteId]
  } else if (path === '/trash') {
    selectedKeys.value = ['trash']
  } else {
    selectedKeys.value = []
  }
}

// 初始化选中状态
updateSelectedKeys()

// 监听路由变化
watch(
  () => router.currentRoute.value.path,
  () => {
    updateSelectedKeys()
  },
)

function handleMenuClick(e: { key: string }) {
  if (e.key === 'ai') {
    router.push('/ai')
  } else if (e.key === 'trash') {
    // 回收站被点击，导航到回收站页面
    router.push('/trash')
  }
}

function handleDocumentsClick(event: Event) {
  event.stopPropagation()
  // 我的文档被点击，导航到文档页面
  router.push('/documents')
}

function goToHome() {
  // 点击logo返回主页
  router.push('/home')
}

async function onDrop(info: AntTreeNodeDropEvent) {
  const dropKey = info.node.key
  const dragKey = info.dragNode.key

  // 防止拖拽到自己
  if (dragKey === dropKey) {
    return
  }

  // 清除之前的防抖定时器
  if (moveDebounceTimer.value) {
    clearTimeout(moveDebounceTimer.value)
  }

  // 保存原始数据用于回滚 - 使用完整的文档树数据
  const originalData = JSON.parse(JSON.stringify(docStore.docTree))

  // 先进行本地更新以提供即时反馈 - 使用完整的文档树数据
  const newData = JSON.parse(JSON.stringify(docStore.docTree))
  let dragNode: DocNode | null = null

  // 从原位置移除节点
  function removeNode(data: DocNode): boolean {
    if (!data.children) return false

    const index = data.children.findIndex(child => child.key === dragKey)
    if (index !== -1) {
      dragNode = data.children[index]
      data.children.splice(index, 1)
      return true
    }

    // 递归查找子节点
    for (const child of data.children) {
      if (child.children && removeNode(child)) {
        return true
      }
    }
    return false
  }

  removeNode(newData)

  // 添加到新位置
  function addNode(data: DocNode): boolean {
    if (!data.children) return false

    const targetIndex = data.children.findIndex(child => child.key === dropKey)
    if (targetIndex === -1) {
      // 递归查找子节点
      for (const child of data.children) {
        if (child.children && addNode(child)) {
          return true
        }
      }
      return false
    }

    const targetNode = data.children[targetIndex]

    if (!info.dropToGap) {
      // 拖拽到节点内部
      if (targetNode.type === 'folder') {
        // 拖拽到文件夹内部
        targetNode.children = targetNode.children || []
        targetNode.children.unshift(dragNode!)
      } else {
        // 拖拽到mote文件上，作为同级节点
        const dropIndex = info.dropPosition === -1 ? targetIndex : targetIndex + 1
        data.children.splice(dropIndex, 0, dragNode!)
      }
    } else {
      // 拖拽到间隙
      const dropIndex = info.dropPosition === -1 ? targetIndex : targetIndex + 1
      data.children.splice(dropIndex, 0, dragNode!)
    }

    return true
  }

  addNode(newData)

  // 更新本地状态
  docStore.updateLocalDocTree(newData.children || [])

  // 使用防抖机制延迟API调用
  moveDebounceTimer.value = setTimeout(async () => {
    try {
      const position = info.dropPosition === -1 ? 0 : undefined
      const result = await moveNode(String(dragKey), String(dropKey), position)

      if (!result.success) {
        message.error(result.error?.message || '移动失败')
        // 回滚本地更改
        docStore.updateLocalDocTree(originalData.children || [])
      } else {
        message.success('移动成功')
      }
    } catch {
      message.error('移动失败，网络错误')
      // 回滚本地更改
      docStore.updateLocalDocTree(originalData.children || [])
    }
  }, 300) // 300ms防抖延迟

  emit('drop', info)
}

// ==================== 拖拽功能 ====================
function startResize(event: MouseEvent) {
  isDragging.value = true
  startX.value = event.clientX
  startWidth.value = sidebarWidth.value

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)

  event.preventDefault()
}

function onResize(event: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = event.clientX - startX.value
  const newWidth = Math.max(200, Math.min(500, startWidth.value + deltaX))

  sidebarWidth.value = newWidth

  if (newWidth <= 200) {
    collapsedValue.value = true
  } else {
    collapsedValue.value = false
  }

  event.preventDefault()
}

function stopResize() {
  isDragging.value = false

  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

// ==================== 清理 ====================
onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)

  // 清理定时器
  if (moveDebounceTimer.value) {
    clearTimeout(moveDebounceTimer.value)
  }
})
</script>

<style scoped lang="less">
// ==================== 基础样式 ====================
.logo {
  height: 40px;
  margin: 16px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: 'Motes';
    font-size: 20px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.6);
    padding-left: 14.5px;
    transition: opacity 0.3s ease;
  }
}

// 折叠状态的logo样式
.logo-collapsed {
  justify-content: center !important;
  padding-left: 0 !important;

  &::before {
    content: 'M' !important;
    font-size: 20px !important;
    padding-left: 0 !important;
  }
}

// 可点击的菜单标题样式
:deep(.ant-menu-submenu-title) {
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
}

.sider-scroll {
  height: calc(85vh);
  overflow-y: auto;
}

// ==================== 菜单样式 ====================
.sidebar-menu {
  background-color: transparent !important;
}

.menu-title {
  font-weight: bold !important;
  font-size: 16px !important;
}

// 添加按钮样式
.search-container {
  position: relative;
  padding: 10px 20px 5px 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
}

.add-button {
  background-color: rgba(0, 0, 0, 0.66) !important;
  border: none !important;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.88) !important;
  }

  .anticon {
    color: white !important;
    font-size: 14px;
  }
}

:deep(.ant-tree) {
  padding: 0px 20px 10px 40px !important;
}

.sider-scroll .search-input {
  flex: 1;
  background-color: #ffffff !important;
}

.highlight-text {
  color: #f50 !important;
}

// ==================== 树形组件样式 ====================
:deep(.ant-tree-node-content-wrapper) {
  cursor: pointer !important;
  padding-left: 0 !important;

  &:hover {
    background-color: #f5f5f5 !important;
  }
}

:deep(.ant-tree-drop-indicator) {
  background-color: #1890ff !important;
  height: 2px !important;
}

:deep(.ant-tree-switcher-noop) {
  display: none !important;
}

:deep(.ant-tree-switcher_open),
:deep(.ant-tree-switcher_close) {
  display: inline-block !important;
}

// 拖拽时的样式
:deep(.ant-tree-treenode-dragging) {
  opacity: 0.5;
}

:deep(.ant-tree-drop-target) {
  background-color: #e6f7ff !important;
}

// 移动中的节点样式
:deep(.ant-tree-treenode-loading) {
  .ant-tree-node-content-wrapper {
    background-color: #f0f8ff !important;
  }
}

// ==================== 拖拽样式 ====================
.resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 1000;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(24, 144, 255, 0.06);
  }
}

.ant-layout-sider {
  transition: width 0.5s ease;

  &.dragging {
    transition: none;
  }
}

:deep(.ant-layout-sider-trigger) {
  background: transparent !important;

  &:hover {
    background: rgba(0, 0, 0, 0.04) !important;
  }
}
</style>
