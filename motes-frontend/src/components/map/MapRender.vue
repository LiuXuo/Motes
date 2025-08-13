<!--
  思维导图渲染组件

  主要功能：
  - 基于 AntV X6 图形库渲染思维导图
  - 提供缩放控制和节点操作界面
  - 集成节点编辑和操作功能
  - 支持键盘快捷键和鼠标交互

  Dependencies:
  - @antv/x6: 图形渲染库
  - @antv/hierarchy: 层级布局算法
  - useMoteStore: 脑图状态管理
-->
<template>
  <div style="width: 100%; height: 100%">
    <!-- 图形渲染容器 -->
    <div id="container" style="width: 100%; height: 100%"></div>

    <!-- 缩放控制器 -->
    <a-slider
      v-model:value="zoom"
      :min="0.2"
      :max="2"
      :step="0.01"
      :vertical="true"
      style="position: absolute; top: 64px; right: 24px; height: 300px; z-index: 10"
    />

    <!-- 节点操作卡片 -->
    <NodeCard
      :mote-store="moteStore"
      :render-graph="renderGraph"
      :select-node="selectNode"
      @update-editing-text="(text) => (moteStore.editingNodeText = text)"
      @update-is-editing="(isEditing) => (moteStore.isEditing = isEditing)"
      @start-editing="() => moteStore.startEditing()"
      @handle-text-confirm="() => moteStore.handleTextConfirm()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Graph } from '@antv/x6'
import { useMoteStore } from '@/stores/moteStore'
import NodeCard from './NodeCard.vue'
import {
  registerNodeTypes,
  registerConnectors,
  renderGraph as renderGraphFn,
} from './graphRenderer'
import { selectNode as selectNodeFn, initGraphEvents } from './graphEvents'

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
 * 缩放控制值
 *
 * 控制思维导图的缩放比例，范围 0.2-2.0
 * 通过垂直滑块进行调节
 */
const zoom = ref(1)

/**
 * 图形实例
 *
 * AntV X6 图形库的实例，负责渲染和管理思维导图
 */
let graph: Graph

// ==================== 核心函数 ====================
/**
 * 选中指定节点
 *
 * 在思维导图中选中指定ID的节点，并更新相关状态
 *
 * @param {string} nodeId - 要选中的节点ID
 *
 * @example
 * selectNode('node123')
 * // 选中ID为 node123 的节点
 */
const selectNode = (nodeId: string) => {
  if (graph) {
    selectNodeFn(graph, nodeId, moteStore)
  }
}

/**
 * 渲染图形
 *
 * 重新渲染整个思维导图，通常在数据变化后调用
 *
 * @example
 * renderGraph()
 * // 重新渲染思维导图
 */
const renderGraph = () => {
  if (graph) {
    renderGraphFn(graph, moteStore.moteTree)
  }
}

// ==================== 监听器 ====================
/**
 * 缩放控制监听
 *
 * 监听缩放值变化，实时更新图形缩放比例
 */
watch(zoom, (val) => {
  if (graph) {
    graph.zoomTo(val)
  }
})

/**
 * 监听选中节点变化
 *
 * 当选中节点发生变化时，清空编辑文本状态
 */
watch(
  () => moteStore.selectedNodeId,
  (newNodeId) => {
    if (newNodeId && !moteStore.isEditing) {
      moteStore.editingNodeText = ''
    }
  }
)

/**
 * 监听数据变化
 *
 * 当脑图树数据发生变化时，重新渲染图形并同步更新选中节点的标签
 * 支持深度监听，确保所有层级的数据变化都能被捕获
 */
watch(
  () => moteStore.moteTree,
  () => {
    // 重新渲染图形
    renderGraph()

    // 同步更新选中节点的标签
    if (moteStore.selectedNodeId) {
      const updatedLabel = moteStore.findNodeText(moteStore.moteTree, moteStore.selectedNodeId)
      if (updatedLabel !== moteStore.selectedNodeLabel) {
        moteStore.selectedNodeLabel = updatedLabel
        if (moteStore.isEditing) {
          moteStore.editingNodeText = updatedLabel
          moteStore.originalText = updatedLabel
        }
      }
    }
  },
  { deep: true },
)

// ==================== 生命周期 ====================
/**
 * 组件挂载时初始化
 *
 * 在组件挂载时执行以下操作：
 * - 注册节点类型和连接器
 * - 初始化图形实例
 * - 设置图形事件监听
 * - 渲染初始图形
 * - 设置清理函数
 */
onMounted(() => {
  // 注册节点类型和连接器
  registerNodeTypes()
  registerConnectors()

  // 初始化图形实例
  graph = new Graph({
    container: document.getElementById('container')!,
    connecting: { connectionPoint: 'anchor' },
    panning: true,
    interacting: {
      nodeMovable: false,
      edgeMovable: false,
      edgeLabelMovable: false,
      magnetConnectable: false,
    },
  })

  // 初始化图形事件
  const cleanup = initGraphEvents(graph, moteStore, renderGraph, selectNode, zoom)

  // 渲染图形
  renderGraph()

  // 保存清理函数
  onBeforeUnmount(() => {
    cleanup()
  })
})
</script>

<style scoped lang="less">
/* 右下角卡片动画 */
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

/* 按钮网格布局 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  justify-items: center;
}

/* 快捷键说明 */
.shortcut-help {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 12px;
  color: #666;
}

/* 卡片样式（该视图特有），保留在本地 */
:deep(.ant-card) {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  overflow: hidden;
  border: none;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 20px;
}

:deep(.ant-card-body) {
  padding: 20px;
}

/* 与 Ant Design 的通用覆写已移至全局样式 */
</style>
