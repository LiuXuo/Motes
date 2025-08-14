<!--
  应用头部组件

  主要功能：
  - 面包屑导航显示当前路径
  - 脑图笔记视图模式切换（思维导图/大纲笔记）
  - 文档保存功能（手动保存按钮）
  - 用户头像和登出功能
  - 响应式布局适配
-->
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
          <span v-else>{{ moteStore.isDirty ? t('AppHeaderVue.save') : t('AppHeaderVue.saved') }}</span>
        </a-button>
                  <a-segmented
            v-model:value="viewMode"
            :options="[
              { label: t('AppHeaderVue.viewMode.map'), value: 'map' },
              { label: t('AppHeaderVue.viewMode.note'), value: 'note' },
            ]"
          />
      </div>
      <!-- 语言切换按钮（非mote路由下显示） -->
      <LanguageSwitch v-if="!isMoteRoute" />
      <!-- 用户头像和下拉菜单 -->
      <a-dropdown :trigger="['click']">
        <a-avatar :style="{ cursor: 'pointer' }" size="small">
          {{ userInitial }}
        </a-avatar>
        <template #overlay>
          <a-menu>
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              {{ t('AppHeaderVue.logout') }}
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
import { useI18n } from 'vue-i18n'
import { useDocStore, type DocNode } from '@/stores/docStore'
import { useMoteStore } from '@/stores/moteStore'
import { useUserStore } from '@/stores/userStore'
import { message } from 'ant-design-vue'
import LanguageSwitch from '../LanguageSwitch.vue'
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileMarkdownOutlined,
  DeleteOutlined,
  LoadingOutlined,
  LogoutOutlined,
  RobotOutlined,
} from '@ant-design/icons-vue'

const { t } = useI18n()

/**
 * 面包屑项接口
 *
 * 定义面包屑导航中每个项目的数据结构，
 * 包含显示信息和导航路径。
 *
 * @interface BreadcrumbItem
 */
interface BreadcrumbItem {
  /** 项目唯一标识符 */
  key: string
  /** 显示标题 */
  title: string
  /** 导航路径 */
  path: string
  /** 项目类型，用于显示对应图标 */
  type: 'documents' | 'folder' | 'mote' | 'trash' | 'ai'
}

// ==================== 路由和状态管理 ====================
const router = useRouter()
const route = useRoute()
const docStore = useDocStore()
const moteStore = useMoteStore()
const userStore = useUserStore()

/**
 * 视图模式响应式绑定
 *
 * 双向绑定脑图笔记的视图模式，
 * 支持思维导图和大纲笔记两种模式切换。
 *
 * @type {ComputedRef<'map' | 'note'>}
 */
const viewMode = computed({
  get: () => moteStore.viewMode,
  set: (value: 'map' | 'note') => {
    moteStore.viewMode = value
  },
})

/**
 * 检查当前是否为脑图笔记路由
 *
 * 根据当前路由路径判断是否在脑图笔记页面，
 * 用于控制保存按钮和视图切换的显示。
 *
 * @returns {boolean} 是否在脑图笔记页面
 */
const isMoteRoute = computed(() => {
  return route.path.startsWith('/mote/')
})

/**
 * 获取面包屑图标组件
 *
 * 根据面包屑项的类型返回对应的图标组件，
 * 提供视觉化的导航提示。
 *
 * @param {BreadcrumbItem['type']} type - 面包屑项类型
 * @returns {Component} 对应的图标组件
 *
 * @example
 * const icon = getBreadcrumbIcon('folder') // 返回 FolderOpenOutlined 组件
 */
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

/**
 * 查找节点路径的工具函数
 *
 * 在文档树中查找指定节点的完整路径，
 * 用于构建面包屑导航的层级结构。
 *
 * @param {string} targetKey - 目标节点的唯一标识
 * @param {DocNode[]} nodes - 要搜索的节点数组
 * @returns {DocNode[]} 从根节点到目标节点的路径数组
 *
 * @example
 * const path = findNodePath('node123', docTree.children)
 * // 返回: [rootNode, parentNode, targetNode]
 */
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

/**
 * 生成面包屑数据
 *
 * 根据当前路由路径生成面包屑导航数据，
 * 支持文档、文件夹、脑图笔记、回收站和AI生成等不同页面类型。
 *
 * @returns {BreadcrumbItem[]} 面包屑项目数组
 *
 * @example
 * const breadcrumbs = generateBreadcrumb()
 * // 返回: [{ key: 'documents', title: '我的文档', path: '/documents', type: 'documents' }, ...]
 */
function generateBreadcrumb(): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  if (route.path === '/trash') {
    // 回收站作为独立顶级目录
    items.push({
      key: 'trash',
      title: t('AppHeaderVue.breadcrumb.trash'),
      path: '/trash',
      type: 'trash',
    })
  } else if (route.path === '/ai') {
    // AI 生成作为独立顶级目录
    items.push({
      key: 'ai',
      title: t('AppHeaderVue.breadcrumb.ai'),
      path: '/ai',
      type: 'ai',
    })
  } else {
    // 其他路径都从"我的文档"开始
    items.push({
      key: 'documents',
      title: t('AppHeaderVue.breadcrumb.documents'),
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

/**
 * 面包屑项目计算属性
 *
 * 响应式计算当前页面的面包屑导航数据，
 * 当路由或文档树发生变化时自动更新。
 *
 * @type {ComputedRef<BreadcrumbItem[]>}
 */
const breadcrumbItems = computed(() => {
  return generateBreadcrumb()
})

/**
 * 处理面包屑点击事件
 *
 * 当用户点击面包屑项目时进行页面导航，
 * 支持任意层级的快速跳转。
 *
 * @param {BreadcrumbItem} item - 被点击的面包屑项目
 *
 * @example
 * handleBreadcrumbClick({ key: 'folder123', title: '工作文档', path: '/folder/folder123', type: 'folder' })
 * // 导航到 /folder/folder123
 */
function handleBreadcrumbClick(item: BreadcrumbItem) {
  router.push(item.path)
}

// ==================== 保存功能 ====================
/**
 * 保存状态管理
 *
 * 控制保存按钮的加载状态，
 * 防止重复点击和提供用户反馈。
 *
 * @type {Ref<boolean>}
 */
const isSaving = ref(false)

/**
 * 处理文档保存
 *
 * 手动保存当前脑图笔记文档，
 * 包含加载状态管理和用户提示。
 *
 * @returns {Promise<void>}
 *
 * @example
 * await handleSave()
 * // 显示保存成功或失败的消息
 *
 * @throws {Error} 当保存过程中发生网络错误时
 * @throws {Error} 当文档数据无效时
 */
async function handleSave() {
  if (isSaving.value) return

  isSaving.value = true

  try {
    // 调用store的保存函数
    const success = await moteStore.saveDocument()

    if (success) {
      message.success(t('AppHeaderVue.messages.saveSuccess'))
    } else {
      message.error(t('AppHeaderVue.messages.saveFailed'))
    }
  } catch {
    message.error(t('AppHeaderVue.messages.saveError'))
  } finally {
    isSaving.value = false
  }
}

// ==================== 用户功能 ====================
/**
 * 计算用户头像显示字符
 *
 * 根据当前登录用户的用户名生成头像显示字符，
 * 取用户名的第一个字符并转为大写。
 *
 * @type {ComputedRef<string>}
 *
 * @example
 * // 如果用户名为 "张三"，返回 "张"
 * // 如果没有用户名，返回 "U"
 */
const userInitial = computed(() => {
  if (userStore.currentUser?.username) {
    return userStore.currentUser.username.charAt(0).toUpperCase()
  }
  return 'U'
})

/**
 * 处理用户登出
 *
 * 执行用户登出操作并跳转到登录页面，
 * 清理用户状态和认证信息。
 *
 * @returns {Promise<void>}
 *
 * @example
 * await handleLogout()
 * // 用户被重定向到登录页面
 */
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
