<template>
  <a-layout-header
    style="
      padding: 0;
      background-color: transparent;
      display: flex;
      justify-content: space-between;
      align-items: center;
    "
  >
    <a-breadcrumb style="margin: 16px">
      <a-breadcrumb-item
        v-for="item in breadcrumbItems"
        :key="item.key"
        @click="handleBreadcrumbClick(item)"
        style="cursor: pointer"
      >
        <component :is="getBreadcrumbIcon(item.type)" style="margin-right: 4px" />
        {{ item.title }}
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div style="display: flex; align-items: center; gap: 12px; margin-right: 16px">
      <div v-if="isMoteRoute" style="display: flex; align-items: center; gap: 12px">
        <a-button
          :disabled="!moteStore.isDirty || isSaving"
          @click="handleSave"
          class="save-button"
          size="small"
          type="primary"
        >
          <LoadingOutlined v-if="isSaving" />
          <span v-else>{{ moteStore.isDirty ? '保存' : '已保存' }}</span>
        </a-button>
        <a-segmented
          v-model:value="viewMode"
          :options="[
            { label: '思维导图', value: 'map' },
            { label: '大纲笔记', value: 'note' },
          ]"
        />
      </div>
      <!-- 用户头像和下拉菜单 -->
      <a-dropdown :trigger="['click']">
        <a-avatar :style="{ cursor: 'pointer' }" size="small">
          {{ userInitial }}
        </a-avatar>
        <template #overlay>
          <a-menu>
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              登出
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDocStore, type DocNode } from '@/stores/docStore'
import { useMoteStore } from '@/stores/moteStore'
import { useUserStore } from '@/stores/userStore'
import { message } from 'ant-design-vue'
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileMarkdownOutlined,
  DeleteOutlined,
  LoadingOutlined,
  LogoutOutlined,
  RobotOutlined,
} from '@ant-design/icons-vue'

// 面包屑项接口
interface BreadcrumbItem {
  key: string
  title: string
  path: string
  type: 'documents' | 'folder' | 'mote' | 'trash' | 'ai'
}

const router = useRouter()
const route = useRoute()
const docStore = useDocStore()
const moteStore = useMoteStore()
const userStore = useUserStore()


// 使用store中的viewMode状态
const viewMode = computed({
  get: () => moteStore.viewMode,
  set: (value: 'map' | 'note') => {
    moteStore.viewMode = value
  },
})

// 检查当前是否为mote路由
const isMoteRoute = computed(() => {
  return route.path.startsWith('/mote/')
})

// 获取面包屑图标
function getBreadcrumbIcon(type: BreadcrumbItem['type']) {
  switch (type) {
    case 'documents':
      return FolderOutlined
    case 'folder':
      return FolderOpenOutlined
    case 'mote':
      return FileMarkdownOutlined
    case 'trash':
      return DeleteOutlined
    case 'ai':
      return RobotOutlined
    default:
      return FolderOutlined
  }
}

// 查找节点路径的工具函数
function findNodePath(targetKey: string, nodes: DocNode[]): DocNode[] {
  function findPath(currentPath: DocNode[], node: DocNode): DocNode[] | null {
    const newPath = [...currentPath, node]

    if (node.key === targetKey) {
      return newPath
    }

    if (node.children) {
      for (const child of node.children) {
        const result = findPath(newPath, child)
        if (result) return result
      }
    }

    return null
  }

  for (const node of nodes) {
    const path = findPath([], node)
    if (path) return path
  }

  return []
}

// 生成面包屑数据
function generateBreadcrumb(): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  if (route.path === '/trash') {
    // 回收站作为独立顶级目录
    items.push({
      key: 'trash',
      title: '回收站',
      path: '/trash',
      type: 'trash',
    })
  } else if (route.path === '/ai') {
    // AI 生成作为独立顶级目录
    items.push({
      key: 'ai',
      title: 'AI 生成',
      path: '/ai',
      type: 'ai',
    })
  } else {
    // 其他路径都从"我的文档"开始
    items.push({
      key: 'documents',
      title: '我的文档',
      path: '/documents',
      type: 'documents',
    })

    if (route.path.startsWith('/folder/')) {
      const folderId = route.params.folderId as string
      const folderPath = findNodePath(folderId, docStore.docTree.children || [])
      folderPath.forEach((node) => {
        items.push({
          key: node.key,
          title: node.title,
          path: `/folder/${node.key}`,
          type: 'folder',
        })
      })
    } else if (route.path.startsWith('/mote/')) {
      const moteId = route.params.moteId as string
      const motePath = findNodePath(moteId, docStore.docTree.children || [])
      // 添加文件夹路径
      motePath.slice(0, -1).forEach((node) => {
        items.push({
          key: node.key,
          title: node.title,
          path: `/folder/${node.key}`,
          type: 'folder',
        })
      })
      // 添加文档节点
      const moteNode = motePath[motePath.length - 1]
      if (moteNode) {
        items.push({
          key: moteNode.key,
          title: moteNode.title,
          path: `/mote/${moteNode.key}`,
          type: 'mote',
        })
      }
    }
  }

  return items
}

// 计算面包屑项
const breadcrumbItems = computed(() => {
  return generateBreadcrumb()
})

// 处理面包屑点击
function handleBreadcrumbClick(item: BreadcrumbItem) {
  router.push(item.path)
}

// 保存状态管理
const isSaving = ref(false)

// 处理保存
async function handleSave() {
  if (isSaving.value) return

  isSaving.value = true

  try {
    // 调用store的保存函数
    const success = await moteStore.saveDocument()

    if (success) {
      message.success('保存成功')
    } else {
      message.error('保存失败')
    }
  } catch (error) {
    console.error('保存错误:', error)
    message.error('保存过程中发生错误')
  } finally {
    isSaving.value = false
  }
}

// 计算用户首字母
const userInitial = computed(() => {
  if (userStore.currentUser?.username) {
    return userStore.currentUser.username.charAt(0).toUpperCase()
  }
  return 'U'
})

// 处理登出
async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="less">
.save-button {
  background-color: rgba(0, 0, 0, 0.66) !important;

  color: #fff !important;
  width: 60px !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0.88) !important;
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.2) !important;
    color: rgba(255, 255, 255, 0.8) !important;
  }
}
</style>
