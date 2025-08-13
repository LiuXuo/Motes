<!--
  大纲笔记渲染组件

  主要功能：
  - 渲染大纲笔记视图
  - 处理节点选中和编辑
  - 集成快捷键面板
  - 支持背景点击清空选中

  Dependencies:
  - useMoteStore: 脑图状态管理
  - NoteOutline: 大纲组件
  - ShortcutsPanel: 快捷键面板
-->
<template>
  <div class="note-render" @click="handleBackgroundClick">
    <!-- 大纲容器 -->
    <NoteOutline
      :selected-node-id="moteStore.selectedNodeId"
      @node-click="handleNodeClick"
      @node-toggle="handleNodeToggle"
    />

    <!-- 快捷键面板 -->
    <ShortcutsPanel
      :show-card="!!moteStore.selectedNodeId && !isCardManuallyClosed"
      :show-close-button="!!moteStore.selectedNodeId && !isCardManuallyClosed"
      :show-popup-button="isCardManuallyClosed"
      @close="closeCard"
      @show="showCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMoteStore } from '@/stores/moteStore'
import NoteOutline from './NoteOutline.vue'
import ShortcutsPanel from './ShortcutsPanel.vue'
import { useNoteScroll } from './useNoteScroll'

// ==================== 状态管理 ====================
/**
 * 脑图状态管理 Store
 *
 * 管理脑图的核心状态，包括：
 * - 脑图树数据结构
 * - 节点选中和编辑状态
 * - 视图模式配置
 */
const moteStore = useMoteStore()

/**
 * 卡片手动关闭状态
 *
 * 记录用户是否手动关闭了快捷键面板
 */
const isCardManuallyClosed = ref(false)

/**
 * 滚动工具函数
 *
 * 提供滚动到指定节点的功能
 */
const { scrollToCenter } = useNoteScroll()

// ==================== 快捷键处理 ====================
/**
 * 键盘事件处理函数
 *
 * 处理全局键盘事件，执行相应的快捷键操作
 * 如果快捷键被处理且选中了节点，则滚动到该节点
 *
 * @param {KeyboardEvent} event - 键盘事件对象
 *
 * @example
 * document.addEventListener('keydown', handleKeyDown)
 */
const handleKeyDown = (event: KeyboardEvent) => {
  const keyboardHandler = moteStore.createKeyboardHandler(moteStore.isEditing, 'note')
  const result = keyboardHandler(event)

  // 如果快捷键被处理了，可能需要滚动到选中节点
  if (result && moteStore.selectedNodeId) {
    scrollToCenter(moteStore.selectedNodeId)
  }
}

// ==================== 事件处理 ====================
/**
 * 节点点击事件处理函数
 *
 * 当用户点击节点时，选中该节点
 *
 * @param {string} nodeId - 被点击的节点ID
 *
 * @example
 * @node-click="handleNodeClick"
 */
const handleNodeClick = (nodeId: string) => {
  moteStore.selectNode(nodeId)
}

/**
 * 节点折叠/展开事件处理函数
 *
 * 当用户点击折叠/展开按钮时，切换节点的折叠状态
 *
 * @param {string} nodeId - 要切换折叠状态的节点ID
 *
 * @example
 * @node-toggle="handleNodeToggle"
 */
const handleNodeToggle = (nodeId: string) => {
  moteStore.toggleNodeCollapse(nodeId)
}

/**
 * 背景点击事件处理函数
 *
 * 当用户点击背景区域时，清空当前选中状态
 *
 * @param {Event} event - 点击事件对象
 *
 * @example
 * @click="handleBackgroundClick"
 */
const handleBackgroundClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('note-render') || target.classList.contains('outline-container')) {
    moteStore.clearSelection()
  }
}

// ==================== 卡片控制函数 ====================
/**
 * 关闭快捷键面板
 *
 * 将面板标记为手动关闭状态，避免自动重新显示
 *
 * @example
 * @close="closeCard"
 */
const closeCard = () => {
  isCardManuallyClosed.value = true
}

/**
 * 显示快捷键面板
 *
 * 重置面板的关闭状态，允许面板正常显示
 *
 * @example
 * @show="showCard"
 */
const showCard = () => {
  isCardManuallyClosed.value = false
}

// ==================== 监听选中节点变化 ====================
// 当选中节点变化时，如果卡片被手动收起，则不会重新显示
watch(
  () => moteStore.selectedNodeId,
  (newNodeId) => {
    if (newNodeId && isCardManuallyClosed.value) {
      // 如果卡片被手动收起，则不显示
      return
    }

    if (newNodeId) {
      scrollToCenter(newNodeId)
    }
  },
)

// ==================== 生命周期 ====================
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="less">
.note-render {
  width: 100%;
  height: 95vh;
  padding: 20px 100px 20px 20px;
  display: flex;
  justify-content: center;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

// 淡入淡出动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px) translateY(30px) scale(0.9);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px) translateY(30px) scale(0.9);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0) translateY(0) scale(1);
}
</style>
