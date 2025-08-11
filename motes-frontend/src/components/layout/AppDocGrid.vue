<template>
  <div class="doc-grid">
    <h1 class="doc-title">{{ getTitle() }}</h1>
    <div v-if="docStore.isLoading" class="loading-container">
      <LoadingOutlined style="font-size: 48px" />
      <p>正在加载文档...</p>
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
    <AEmpty v-else description="暂无内容" class="empty-container" />
  </div>

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
</template>

<script setup lang="ts">
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

const route = useRoute()
const router = useRouter()
const docStore = useDocStore()
// 移动弹窗状态
const moveModalOpen = ref(false)
const movingNodeKey = ref<string | null>(null)
// 重命名对话框状态
const renameModalVisible = ref(false)
const renameModalTitle = ref('')
const renameModalValue = ref('')
const renameModalTarget = ref<DocNode | null>(null)
const renameInputRef = ref<HTMLInputElement>()

// 根据路由确定类型
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
      return '我的文档'
    case 'folder':
      // 根据 folderId 查找文件夹名称
      if (!effectiveFolderId.value) return '文件夹'
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
            if (found && found !== '文件夹') {
              return found
            }
          }
        }

        return '文件夹'
      }
      return findFolderName(docStore.docTree.children || [])
    case 'trash':
      return '回收站'
    default:
      return '我的文档'
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
  const title = type === 'folder' ? '新建文件夹' : '新建文档'

  try {
    const result = await docStore.createNode(title, type, parentKey)
    if (result.success) {
      message.success(`${type === 'folder' ? '文件夹' : '文档'}创建成功`)
    } else {
      message.error(result.error?.message || '创建失败')
    }
  } catch (error) {
    console.error('创建节点失败:', error)
    message.error('创建失败')
  }
}

// 创建副本
const handleDuplicateNode = async (key: string) => {
  try {
    const result = await docStore.duplicateNode(key)
    if (result.success) {
      message.success('副本创建成功')
    } else {
      message.error(result.error?.message || '创建副本失败')
    }
  } catch (error) {
    console.error('创建副本失败:', error)
    message.error('创建副本失败')
  }
}

// 显示重命名对话框
const showRenameModal = (node: DocNode) => {
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
      message.success('重命名成功')
      renameModalVisible.value = false
      // 清空状态
      renameModalTarget.value = null
      renameModalValue.value = ''
    } else {
      message.error(result.error?.message || '重命名失败')
    }
  } catch (error) {
    console.error('重命名失败:', error)
    message.error('重命名失败')
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
      message.success('删除成功')
    } else {
      message.error(result.error?.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 恢复节点
const handleRestoreNode = async (key: string) => {
  try {
    const result = await docStore.restoreNode(key)
    if (result.success) {
      message.success('恢复成功')
    } else {
      message.error(result.error?.message || '恢复失败')
    }
  } catch (error) {
    console.error('恢复失败:', error)
    message.error('恢复失败')
  }
}

// 永久删除节点
const handlePermanentDeleteNode = async (key: string) => {
  try {
    const result = await docStore.permanentDeleteNode(key)
    if (result.success) {
      message.success('永久删除成功')
    } else {
      message.error(result.error?.message || '永久删除失败')
    }
  } catch (error) {
    console.error('永久删除失败:', error)
    message.error('永久删除失败')
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
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

const handleMoveConfirm = async (folderKey: string) => {
  if (!movingNodeKey.value) return
  try {
    const result = await docStore.moveNode(movingNodeKey.value, folderKey)
    if (result.success) {
      message.success('移动成功')
    } else {
      message.error(result.error?.message || '移动失败')
    }
  } catch (error) {
    console.error('移动失败:', error)
    message.error('移动失败')
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
