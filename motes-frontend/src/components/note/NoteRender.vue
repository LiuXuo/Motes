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
const moteStore = useMoteStore()
const isCardManuallyClosed = ref(false)
const { scrollToCenter } = useNoteScroll()

// ==================== 快捷键处理 ====================
const handleKeyDown = (event: KeyboardEvent) => {
  const keyboardHandler = moteStore.createKeyboardHandler(moteStore.isEditing, 'note')
  const result = keyboardHandler(event)

  // 如果快捷键被处理了，可能需要滚动到选中节点
  if (result && moteStore.selectedNodeId) {
    scrollToCenter(moteStore.selectedNodeId)
  }
}

// ==================== 事件处理 ====================
const handleNodeClick = (nodeId: string) => {
  moteStore.selectNode(nodeId)
}

const handleNodeToggle = (nodeId: string) => {
  moteStore.toggleNodeCollapse(nodeId)
}

const handleBackgroundClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('note-render') || target.classList.contains('outline-container')) {
    moteStore.clearSelection()
  }
}

// ==================== 卡片控制函数 ====================
const closeCard = () => {
  isCardManuallyClosed.value = true
}

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
