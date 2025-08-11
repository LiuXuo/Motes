<template>
  <a-dropdown :trigger="['contextmenu']">
    <slot />
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <!-- 回收站上下文 -->
        <template v-if="contextType === 'trash'">
          <a-menu-item key="restore">
            <UndoOutlined />
            恢复
          </a-menu-item>
          <a-menu-item key="delete-permanently" danger>
            <DeleteOutlined />
            永久删除
          </a-menu-item>
        </template>

        <!-- 正常上下文 -->
        <template v-else>
          <!-- 文件夹菜单项 -->
          <template v-if="nodeType === 'folder'">
            <a-menu-item key="new-mote">
              <FileMarkdownOutlined />
              新建文档
            </a-menu-item>
            <a-menu-item key="new-folder">
              <FolderOpenOutlined />
              新建文件夹
            </a-menu-item>
            <a-menu-item key="duplicate">
              <CopyOutlined />
              创建副本
            </a-menu-item>
            <a-menu-item key="rename">
              <EditOutlined />
              重命名
            </a-menu-item>
            <a-menu-item key="delete">
              <DeleteOutlined />
              删除
            </a-menu-item>
            <a-menu-item key="move">
              <FolderOpenOutlined />
              移动到...
            </a-menu-item>
          </template>

          <!-- 文档菜单项 -->
          <template v-else-if="nodeType === 'mote'">
            <a-menu-item key="duplicate">
              <CopyOutlined />
              创建副本
            </a-menu-item>
            <a-menu-item key="rename">
              <EditOutlined />
              重命名
            </a-menu-item>
            <a-menu-item key="delete">
              <DeleteOutlined />
              删除
            </a-menu-item>
            <a-menu-item key="move">
              <FolderOpenOutlined />
              移动到...
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import {
  FileMarkdownOutlined,
  FolderOpenOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons-vue'

// ==================== 类型定义 ====================
interface Props {
  nodeType: string
  contextType: 'normal' | 'trash'
}

interface Emits {
  (e: 'menu-click', nodeKey: string, menuKey: string, nodeData?: any): void
}

// ==================== Props & Emits ====================
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================
const handleMenuClick = (e: { key: string }) => {
  emit('menu-click', '', e.key)
}
</script>

<style scoped>
/* 组件样式可以根据需要添加 */
</style>
