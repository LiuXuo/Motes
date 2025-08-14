<!--
  应用侧边栏组件

  主要功能：
  - 文档树导航和层级展示
  - 文档搜索和过滤
  - 新建文档/文件夹功能
  - 文档导入导出功能
  - 拖拽移动文档
  - 右键菜单操作
  - 侧边栏宽度调整
-->
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
          <span class="menu-title">{{ t('AppSidebarVue.menuItems.ai') }}</span>
        </a-menu-item>
        <a-sub-menu key="documents">
          <template #title>
            <span @click.stop="handleDocumentsClick">
              <folder-outlined />
              <span class="menu-title">{{ t('AppSidebarVue.menuItems.documents') }}</span>
            </span>
          </template>

          <div class="search-container">
            <a-input-search v-model:value="searchValue" class="search-input" :placeholder="t('AppSidebarVue.search')" />
            <a-dropdown :trigger="['click', 'contextmenu']">
              <a-button type="text" class="add-button">
                <PlusOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="handleAddMenuClick">
                  <a-menu-item key="new-mote">
                    <FileMarkdownOutlined />
                    {{ t('AppSidebarVue.addMenu.newMote') }}
                  </a-menu-item>
                  <a-menu-item key="new-folder">
                    <FolderOpenOutlined />
                    {{ t('AppSidebarVue.addMenu.newFolder') }}
                  </a-menu-item>
                  <a-sub-menu key="import">
                    <template #title>
                      <ImportOutlined />
                      {{ t('AppSidebarVue.addMenu.import') }}
                    </template>
                    <a-menu-item key="import-json">
                      <FileTextOutlined />
                      {{ t('AppSidebarVue.addMenu.importJson') }}
                    </a-menu-item>
                    <a-menu-item key="import-markdown">
                      <FileMarkdownOutlined />
                      {{ t('AppSidebarVue.addMenu.importMarkdown') }}
                    </a-menu-item>
                  </a-sub-menu>
                  <a-sub-menu v-if="isMoteRoute" key="export">
                    <template #title>
                      <ExportOutlined />
                      {{ t('AppSidebarVue.addMenu.export') }}
                    </template>
                    <a-menu-item key="export-json">
                      <FileTextOutlined />
                      {{ t('AppSidebarVue.addMenu.exportJson') }}
                    </a-menu-item>
                    <a-menu-item key="export-markdown">
                      <FileMarkdownOutlined />
                      {{ t('AppSidebarVue.addMenu.exportMarkdown') }}
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
           <span class="menu-title">{{ t('AppHeaderVue.breadcrumb.trash') }}</span>
         </a-menu-item>
      </a-menu>
    </div>

    <div v-if="!collapsedValue" class="resize-handle" @mousedown="startResize"></div>
  </a-layout-sider>

  <!-- 选择目标文件夹（用于移动） -->
  <DocTreeModal
    v-model:open="moveModalOpen"
    :title="t('AppDocGridVue.moveModal.title')"
    :okText="t('AppDocGridVue.moveModal.okText')"
    :confirmLoading="docStore.isLoading"
    :excludeSubtreeRootKey="movingNodeKey || undefined"
    @confirm="handleMoveConfirm"
  />

  <!-- 重命名对话框 -->
  <a-modal
    v-model:open="renameModalVisible"
    :title="t('AppDocGridVue.renameModal.title')"
    @ok="handleRenameConfirm"
    @cancel="handleRenameCancel"
    :confirm-loading="docStore.isLoading"
    :z-index="1000"
    :mask-closable="false"
  >
    <a-input
      v-model:value="renameModalValue"
      :placeholder="t('AppDocGridVue.renameModal.placeholder')"
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
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

/**
 * 组件属性接口
 *
 * 定义侧边栏组件的输入属性，
 * 控制侧边栏的显示状态。
 *
 * @interface Props
 */
interface Props {
  /** 是否折叠侧边栏 */
  collapsed?: boolean
}

/**
 * 组件事件接口
 *
 * 定义侧边栏组件触发的事件，
 * 用于与父组件通信。
 *
 * @interface Emits
 */
interface Emits {
  /** 折叠状态变化事件 */
  (e: 'update:collapsed', value: boolean): void
  /** 拖拽完成事件 */
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

/**
 * 侧边栏宽度状态
 *
 * 控制侧边栏的宽度，支持动态调整，
 * 最小宽度200px，最大宽度500px。
 *
 * @type {Ref<number>}
 */
const sidebarWidth = ref(270)

/**
 * 拖拽调整状态
 *
 * 标识当前是否正在进行宽度调整拖拽操作。
 *
 * @type {Ref<boolean>}
 */
const isDragging = ref(false)

/**
 * 拖拽开始位置
 *
 * 记录拖拽开始时的鼠标X坐标。
 *
 * @type {Ref<number>}
 */
const startX = ref(0)

/**
 * 拖拽开始宽度
 *
 * 记录拖拽开始时的侧边栏宽度。
 *
 * @type {Ref<number>}
 */
const startWidth = ref(0)

/**
 * 移动操作防抖定时器
 *
 * 用于防止频繁的拖拽移动操作，
 * 延迟300ms执行实际的API调用。
 *
 * @type {Ref<number | null>}
 */
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
    message.error(t('errors.operationError'))
  }
}

async function handleCreateNode(type: 'folder' | 'mote', parentKey: string) {
  const title = type === 'folder' ? t('AppSidebarVue.addMenu.newFolder') : t('AppSidebarVue.addMenu.newMote')

  try {
    const result = await createNode(title, type, parentKey)
    if (result.success) {
      message.success(t('AppSidebarVue.messages.createSuccess'))
    } else {
      message.error(result.error?.message || t('AppSidebarVue.messages.createFailed'))
    }
  } catch {
    message.error(t('AppSidebarVue.messages.createFailed'))
  }
}

async function handleMoveConfirm(folderKey: string) {
  if (!movingNodeKey.value) return
  try {
    const result = await moveNode(movingNodeKey.value, folderKey)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.moveSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.moveFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.moveFailed'))
  } finally {
    moveModalOpen.value = false
    movingNodeKey.value = null
  }
}

async function handleDuplicateNode(node: DocNode) {
  try {
    const result = await duplicateNode(node.key)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.duplicateSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.duplicateFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.duplicateFailed'))
  }
}

function showRenameModal(node: DocNode) {
  renameModalTarget.value = node
  renameModalTitle.value = t('AppDocGridVue.renameModal.title')
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
      message.success(t('AppDocGridVue.messages.renameSuccess'))
      renameModalVisible.value = false
      // 清空状态
      renameModalTarget.value = null
      renameModalValue.value = ''
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.renameFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.renameFailed'))
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
    message.error(t('AppSidebarVue.messages.importFailed'))
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
      message.success(t('AppDocGridVue.messages.deleteSuccess'))
      // 从选中状态中移除
      selectedKeys.value = selectedKeys.value.filter(k => k !== key)
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.deleteFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.deleteFailed'))
  }
}

async function handleAddMenuClick(e: { key: string }) {
  // 检查文档树是否已加载
  if (docStore.isLoading) {
    message.warning(t('AppSidebarVue.messages.loading'))
    return
  }

  // 检查是否已初始化
  if (!docStore.isInitialized) {
    try {
      const result = await fetchDocTree()
      if (!result.success) {
        message.error(t('AppSidebarVue.messages.fetchDocTreeFailed'))
        return
      }
    } catch {
      message.error(t('AppSidebarVue.messages.fetchDocTreeFailed'))
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
          message.error(t('AppSidebarVue.messages.fetchRootFailed'))
        }
    } catch {
        message.error(t('AppSidebarVue.messages.fetchRootFailed'))
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
         message.error(result.error?.message || t('AppDocGridVue.messages.moveFailed'))
         // 回滚本地更改
         docStore.updateLocalDocTree(originalData.children || [])
       } else {
         message.success(t('AppDocGridVue.messages.moveSuccess'))
       }
     } catch {
       message.error(t('errors.networkError'))
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
// 与 Ant Design 的通用覆写已移至全局样式

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

// 与 Ant Design 的通用覆写已移至全局样式
</style>
