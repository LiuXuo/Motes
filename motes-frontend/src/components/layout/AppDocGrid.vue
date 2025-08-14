<!--
  文档网格视图组件

  主要功能：
  - 文档和文件夹的网格展示
  - 支持不同页面类型（文档、文件夹、回收站）
  - 右键菜单操作（新建、重命名、删除、移动等）
  - 文档导入导出功能
  - 拖拽移动文档
  - 加载状态和空状态处理
-->
<template>
  <div class="doc-grid">
    <h1 class="doc-title">{{ getTitle() }}</h1>
    <div v-if="docStore.isLoading" class="loading-container">
      <LoadingOutlined style="font-size: 48px" />
      <p>{{ t('AppDocGridVue.loading') }}</p>
    </div>
    <div v-else-if="displayDocuments.length > 0" class="doc-grid-container">
      <div
        v-for="item in displayDocuments"
        :key="item.key"
        class="doc-item"
        @click="handleItemClick(item)"
      >
          <DocContextMenu
          :node-type="item.type"
          :context-type="effectiveType === 'trash' ? 'trash' : 'normal'"
            @menu-click="(nodeKey: string, menuKey: string) => onContextMenuClick(item.key, menuKey)"
        >
          <div class="doc-item-content">
            <div class="doc-icon">
              <FileMarkdownFilled v-if="item.type === 'mote'" />
              <FolderFilled v-else-if="item.type === 'folder'" />
            </div>
            <div class="doc-name">{{ item.title }}</div>
          </div>
        </DocContextMenu>
      </div>
    </div>
    <AEmpty v-else :description="t('AppDocGridVue.empty')" class="empty-container" />
  </div>

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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  FileMarkdownFilled,
  FolderFilled,
  LoadingOutlined,
} from '@ant-design/icons-vue'
import { Empty as AEmpty } from 'ant-design-vue'
import { useDocStore } from '@/stores/docStore'
import type { DocNode } from '@/stores/docStore'
import { computed, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import DocContextMenu from './DocContextMenu.vue'
import DocTreeModal from './DocTreeModal.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const docStore = useDocStore()

/**
 * 移动弹窗状态
 *
 * 控制文档移动选择弹窗的显示状态。
 *
 * @type {Ref<boolean>}
 */
const moveModalOpen = ref(false)

/**
 * 正在移动的节点键值
 *
 * 记录当前正在移动的文档或文件夹的键值。
 *
 * @type {Ref<string | null>}
 */
const movingNodeKey = ref<string | null>(null)

/**
 * 重命名对话框状态
 *
 * 控制重命名对话框的显示状态。
 *
 * @type {Ref<boolean>}
 */
const renameModalVisible = ref(false)

/**
 * 重命名对话框标题
 *
 * 重命名对话框的标题文本。
 *
 * @type {Ref<string>}
 */
const renameModalTitle = ref('')

/**
 * 重命名输入值
 *
 * 重命名对话框中的输入框值。
 *
 * @type {Ref<string>}
 */
const renameModalValue = ref('')

/**
 * 重命名目标节点
 *
 * 当前正在重命名的文档或文件夹节点。
 *
 * @type {Ref<DocNode | null>}
 */
const renameModalTarget = ref<DocNode | null>(null)

/**
 * 重命名输入框引用
 *
 * 重命名对话框输入框的DOM引用。
 *
 * @type {Ref<HTMLInputElement>}
 */
const renameInputRef = ref<HTMLInputElement>()

/**
 * 根据路由确定页面类型
 *
 * 根据当前路由路径判断页面类型，
 * 用于控制显示内容和操作权限。
 *
 * @type {ComputedRef<'documents' | 'folder' | 'trash'>}
 *
 * @example
 * // 在 /documents 页面返回 'documents'
 * // 在 /folder/123 页面返回 'folder'
 * // 在 /trash 页面返回 'trash'
 */
const effectiveType = computed(() => {
  if (route.path === '/documents') {
    return 'documents'
  } else if (route.path.startsWith('/folder/')) {
    return 'folder'
  } else if (route.path === '/trash') {
    return 'trash'
  }
  return 'documents'
})

// 根据路由确定文件夹ID
const effectiveFolderId = computed(() => {
  if (route.path.startsWith('/folder/')) {
    return route.params.folderId as string
  }
  return undefined
})

// 根据类型计算显示的数据
const displayDocuments = computed(() => {
  switch (effectiveType.value) {
    case 'documents':
      // 渲染 documents 下第一层 isDeleted 为假的节点
      return (docStore.docTree.children || []).filter((doc) => !doc.isDeleted)
    case 'folder':
      // 根据 folderId 获取文件夹内容，渲染传入 id 节点下一层 isDeleted 为假的节点
      if (!effectiveFolderId.value) return []
      const findFolder = (nodes: DocNode[]): DocNode | null => {
        for (const node of nodes) {
          if (node.key === effectiveFolderId.value) {
            return node
          }
          if (node.children) {
            const found = findFolder(node.children)
            if (found) return found
          }
        }
        return null
      }

      const targetFolder = findFolder(docStore.docTree.children || [])
      if (targetFolder && targetFolder.children) {
        return targetFolder.children.filter((doc) => !doc.isDeleted)
      }
      return []
    case 'trash':
      // 获取所有 isDeleted 为真的节点
      const getAllDeletedNodes = (nodes: DocNode[]): DocNode[] => {
        let deletedNodes: DocNode[] = []
        for (const node of nodes) {
          if (node.isDeleted) {
            deletedNodes.push(node)
          }
          if (node.children) {
            deletedNodes = deletedNodes.concat(getAllDeletedNodes(node.children))
          }
        }
        return deletedNodes
      }
      return getAllDeletedNodes(docStore.docTree.children || [])
    default:
      return docStore.docTree.children || []
  }
})

// 根据类型获取标题
const getTitle = () => {
  switch (effectiveType.value) {
    case 'documents':
      return t('AppDocGridVue.titles.documents')
    case 'folder':
      // 根据 folderId 查找文件夹名称
      if (!effectiveFolderId.value) return t('AppDocGridVue.titles.folder')
      const findFolderName = (nodes: DocNode[]): string => {
        // 遍历所有节点
        for (const node of nodes) {
          // 如果当前节点匹配，直接返回
          if (node.key === effectiveFolderId.value) {
            return node.title
          }

          // 如果当前节点有子节点，递归查找
          if (node.children && node.children.length > 0) {
            // 递归查找子节点
            const found = findFolderName(node.children)
            if (found && found !== t('AppDocGridVue.titles.folder')) {
              return found
            }
          }
        }

        return t('AppDocGridVue.titles.folder')
      }
      return findFolderName(docStore.docTree.children || [])
    case 'trash':
      return t('AppDocGridVue.titles.trash')
    default:
      return t('AppDocGridVue.titles.documents')
  }
}

const handleItemClick = (item: DocNode) => {
  if (item.type === 'folder') {
    // 点击文件夹，导航到文件夹页面
    router.push(`/folder/${item.key}`)
  } else if (item.type === 'mote') {
    // 点击文档，导航到脑图笔记页面
    router.push(`/mote/${item.key}`)
  }
}

// 查找节点的辅助函数
const findNode = (nodes: DocNode[], key: string): DocNode | null => {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

// 创建节点
const handleCreateNode = async (type: 'folder' | 'mote', parentKey: string) => {
  const title = type === 'folder' ? t('AppSidebarVue.addMenu.newFolder') : t('AppSidebarVue.addMenu.newMote')

  try {
    const result = await docStore.createNode(title, type, parentKey)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.createSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.createFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.createFailed'))
  }
}

// 创建副本
const handleDuplicateNode = async (key: string) => {
  try {
    const result = await docStore.duplicateNode(key)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.duplicateSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.duplicateFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.duplicateFailed'))
  }
}

// 显示重命名对话框
const showRenameModal = (node: DocNode) => {
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

// 重命名节点
const handleRenameNode = async (key: string) => {
  const node = findNode(docStore.docTree.children || [], key)
  if (node) {
    showRenameModal(node)
  }
}

// 确认重命名
const handleRenameConfirm = async () => {
  if (!renameModalTarget.value || !renameModalValue.value.trim()) {
    return
  }

  const newTitle = renameModalValue.value.trim()
  if (newTitle === renameModalTarget.value.title) {
    renameModalVisible.value = false
    return
  }

  try {
    const result = await docStore.renameNode(renameModalTarget.value.key, newTitle)
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

// 取消重命名
const handleRenameCancel = () => {
  renameModalVisible.value = false
  renameModalTarget.value = null
  renameModalValue.value = ''
}

// 删除节点
const handleDeleteNode = async (key: string) => {
  try {
    const result = await docStore.deleteNode(key)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.deleteSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.deleteFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.deleteFailed'))
  }
}

// 恢复节点
const handleRestoreNode = async (key: string) => {
  try {
    const result = await docStore.restoreNode(key)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.restoreSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.restoreFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.restoreFailed'))
  }
}

// 永久删除节点
const handlePermanentDeleteNode = async (key: string) => {
  try {
    const result = await docStore.permanentDeleteNode(key)
    if (result.success) {
      message.success(t('AppDocGridVue.messages.permanentDeleteSuccess'))
    } else {
      message.error(result.error?.message || t('AppDocGridVue.messages.permanentDeleteFailed'))
    }
  } catch {
    message.error(t('AppDocGridVue.messages.permanentDeleteFailed'))
  }
}

const onContextMenuClick = async (itemKey: string, menuKey: string | number) => {
  try {
    switch (menuKey) {
      case 'new-folder':
        await handleCreateNode('folder', itemKey)
        break
      case 'new-mote':
        await handleCreateNode('mote', itemKey)
        break
      case 'duplicate':
        await handleDuplicateNode(itemKey)
        break
      case 'rename':
        await handleRenameNode(itemKey)
        break
      case 'delete':
        await handleDeleteNode(itemKey)
        break
      case 'move':
        movingNodeKey.value = itemKey
        moveModalOpen.value = true
        break
      case 'restore':
        await handleRestoreNode(itemKey)
        break
      case 'delete-permanently':
        await handlePermanentDeleteNode(itemKey)
        break
      default:
        break
    }
  } catch {
    message.error(t('errors.operationError'))
  }
}

const handleMoveConfirm = async (folderKey: string) => {
  if (!movingNodeKey.value) return
  try {
    const result = await docStore.moveNode(movingNodeKey.value, folderKey)
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
</script>

<style scoped lang="less">
.doc-grid {
  padding: 50px;
  height: 100vh;
  overflow-y: auto;

  .doc-title {
    font-size: 34px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 32px;
    margin-left: 8px;
  }

  .empty-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 200px);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 200px);

    p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.66);
    }
  }
}

.doc-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 24px;
  padding-bottom: 50px;

  .doc-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-5px);

      .doc-icon {
        color: rgba(0, 0, 0, 0.88);
      }
    }

    .doc-item-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .doc-icon {
      font-size: 64px;
      color: rgba(0, 0, 0, 0.66);
      margin-bottom: 12px;

      :deep(.anticon) {
        font-size: 64px;
      }
    }

    .doc-name {
      font-size: 14px;
      color: #333;
      text-align: center;
      line-height: 1.4;
      word-break: break-word;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}
</style>
