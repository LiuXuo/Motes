<!--
  大纲笔记容器组件

  主要功能：
  - 作为大纲笔记的根容器
  - 渲染递归的节点树结构
  - 处理节点点击和折叠事件

  Props:
  - selectedNodeId: 当前选中的节点ID

  Events:
  - nodeClick: 节点点击事件
  - nodeToggle: 节点折叠/展开事件

  Dependencies:
  - useMoteStore: 脑图状态管理
  - OutlineNode: 大纲节点组件
-->
<template>
  <div class="outline-container">
    <!-- 使用递归组件渲染节点 -->
    <OutlineNode
      :node="data"
      :selected-node-id="selectedNodeId || ''"
      :level="1"
      @node-click="$emit('nodeClick', $event)"
      @node-toggle="$emit('nodeToggle', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMoteStore } from '@/stores/moteStore'
import OutlineNode from './OutlineNode.vue'

// ==================== Props 定义 ====================
interface Props {
  selectedNodeId?: string
}

defineProps<Props>()

// ==================== Emits 定义 ====================
defineEmits<{
  nodeClick: [nodeId: string]
  nodeToggle: [nodeId: string]
}>()

// ==================== 状态管理 ====================
const moteStore = useMoteStore()
const data = computed(() => moteStore.moteTree)
</script>

<style scoped lang="less">
// 通用滚动条隐藏样式
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.outline-container {
  width: 800px;
  margin: 0 auto;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  padding: 20px 0;
  .hide-scrollbar();
}
</style>
