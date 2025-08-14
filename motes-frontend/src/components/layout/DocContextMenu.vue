<!--
  文档右键菜单组件

  主要功能：
  - 根据节点类型显示不同的右键菜单
  - 支持文件夹和文档的不同操作
  - 回收站特殊操作（恢复、永久删除）
  - 菜单项图标和危险操作标识

  Props:
  - nodeType: 节点类型（'folder' | 'mote'）
  - contextType: 上下文类型（'normal' | 'trash'）

  Events:
  - menu-click: 菜单项点击事件
-->
<template>
  <a-dropdown :trigger="['contextmenu']">
    <slot />
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <!-- 回收站上下文 -->
        <template v-if="contextType === 'trash'">
          <a-menu-item key="restore">
            <UndoOutlined />
            {{ t('DocContextMenuVue.menuItems.restore') }}
          </a-menu-item>
          <a-menu-item key="delete-permanently" danger>
            <DeleteOutlined />
            {{ t('common.delete') }}
          </a-menu-item>
        </template>

        <!-- 正常上下文 -->
        <template v-else>
          <!-- 文件夹菜单项 -->
          <template v-if="nodeType === 'folder'">
            <a-menu-item key="new-mote">
              <FileMarkdownOutlined />
              {{ t('AppSidebarVue.addMenu.newMote') }}
            </a-menu-item>
            <a-menu-item key="new-folder">
              <FolderOpenOutlined />
              {{ t('AppSidebarVue.addMenu.newFolder') }}
            </a-menu-item>
            <a-menu-item key="duplicate">
              <CopyOutlined />
              {{ t('DocContextMenuVue.menuItems.copy') }}
            </a-menu-item>
            <a-menu-item key="move">
              <FolderOpenOutlined />
              {{ t('DocContextMenuVue.menuItems.move') }}
            </a-menu-item>
            <a-menu-item key="rename">
              <EditOutlined />
              {{ t('DocContextMenuVue.menuItems.rename') }}
            </a-menu-item>
            <a-menu-item key="delete">
              <DeleteOutlined />
              {{ t('DocContextMenuVue.menuItems.delete') }}
            </a-menu-item>
          </template>

          <!-- 文档菜单项 -->
          <template v-else-if="nodeType === 'mote'">
            <a-menu-item key="duplicate">
              <CopyOutlined />
              {{ t('DocContextMenuVue.menuItems.copy') }}
            </a-menu-item>
            <a-menu-item key="move">
              <FolderOpenOutlined />
              {{ t('DocContextMenuVue.menuItems.move') }}
            </a-menu-item>
            <a-menu-item key="rename">
              <EditOutlined />
              {{ t('DocContextMenuVue.menuItems.rename') }}
            </a-menu-item>
            <a-menu-item key="delete">
              <DeleteOutlined />
              {{ t('DocContextMenuVue.menuItems.delete') }}
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  FileMarkdownOutlined,
  FolderOpenOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons-vue'

const { t } = useI18n()

/**
 * 组件属性接口
 *
 * 定义右键菜单组件的输入属性，
 * 控制菜单的显示内容和行为。
 *
 * @interface Props
 */
interface Props {
  /** 节点类型，决定显示哪些菜单项 */
  nodeType: string
  /** 上下文类型，区分正常模式和回收站模式 */
  contextType: 'normal' | 'trash'
}

/**
 * 组件事件接口
 *
 * 定义右键菜单组件触发的事件，
 * 用于与父组件通信。
 *
 * @interface Emits
 */
interface Emits {
  /** 菜单项点击事件 */
  (e: 'menu-click', nodeKey: string, menuKey: string, nodeData?: unknown): void
}

// ==================== Props & Emits ====================
defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 处理菜单项点击事件
 *
 * 当用户点击右键菜单项时，
 * 触发menu-click事件并传递相关信息。
 *
 * @param {{ key: string }} e - 菜单点击事件对象
 *
 * @example
 * // 用户点击"新建文档"菜单项
 * handleMenuClick({ key: 'new-mote' })
 * // 触发: menu-click('', 'new-mote')
 */
const handleMenuClick = (e: { key: string }) => {
  emit('menu-click', '', e.key)
}
</script>

<style scoped>
/* 组件样式可以根据需要添加 */
</style>
