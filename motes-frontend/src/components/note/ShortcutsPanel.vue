<template>
  <!-- 快捷键提示卡片 -->
  <Transition name="fade-slide">
    <div v-if="showCard" class="shortcuts-card">
      <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-item">
        <span class="key">{{ shortcut.key }}</span>
        <span class="description">{{ shortcut.description }}</span>
      </div>
    </div>
  </Transition>

  <!-- 收起按钮 - 当卡片显示时显示 -->
  <Transition name="fade-slide">
    <div v-if="showCloseButton" class="close-button" @click="$emit('close')">
      <span class="close-icon">×</span>
    </div>
  </Transition>

  <!-- 弹出按钮 - 当卡片被收起时显示 -->
  <Transition name="fade-slide">
    <div v-if="showPopupButton" class="popup-button" @click="$emit('show')">
      <span class="popup-icon">?</span>
      <span class="popup-tooltip">快捷键</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// ==================== Props 定义 ====================
interface Props {
  showCard: boolean
  showCloseButton: boolean
  showPopupButton: boolean
}

defineProps<Props>()

// ==================== Emits 定义 ====================
defineEmits<{
  close: []
  show: []
}>()

// ==================== 类型定义 ====================
interface Shortcut {
  key: string
  description: string
}

// ==================== 快捷键配置 ====================
const shortcuts: Shortcut[] = [
  { key: 'Click', description: '单击选中' },
  { key: 'F2', description: '点击选中节点编辑' },
  { key: '↑', description: '上一个节点' },
  { key: '↓', description: '下一个节点' },
  { key: 'Esc', description: '取消选中' },
  { key: 'Enter', description: '添加子节点' },
  { key: 'Shift + Enter', description: '添加同级节点' },
  { key: 'Delete', description: '删除节点' },
  { key: 'Tab', description: '降级节点' },
  { key: 'Shift + Tab', description: '升级节点' },
  { key: 'Ctrl + ↑', description: '向上移动' },
  { key: 'Ctrl + ↓', description: '向下移动' },
  { key: 'Alt + .', description: '折叠/展开' },
]
</script>

<style scoped lang="less">
.shortcuts-card {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 240px;
  padding: 20px;
  z-index: 1000;

  // 通用滚动条隐藏样式
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 6px 0;

    &:last-child {
      margin-bottom: 0;
    }

    .key {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 500;
      color: #333;
      font-family: 'Courier New', monospace;
      min-width: 60px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .description {
      font-size: 13px;
      color: #666;
      flex: 1;
      margin-left: 12px;
    }
  }
}

.close-button {
  position: absolute;
  right: 20px;
  bottom: 40px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.1);
  }

  .close-icon {
    font-size: 16px;
    color: #666;
    font-weight: bold;
    line-height: 1;
  }
}

.popup-button {
  position: absolute;
  right: 20px;
  bottom: 40px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.1);
  }

  .popup-icon {
    font-size: 16px;
    color: #666;
    font-weight: bold;
    line-height: 1;
  }

  .popup-tooltip {
    position: absolute;
    right: 35px;
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(5px);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &:hover .popup-tooltip {
    opacity: 1;
    transform: translateX(0);
  }
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
