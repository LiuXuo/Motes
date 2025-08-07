<template>
  <div style="width: 100%; height: 100%">
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
const moteStore = useMoteStore()

// 缩放控制
const zoom = ref(1)

// 图形实例
let graph: Graph

// ==================== 核心函数 ====================
/**
 * 选中指定节点
 */
const selectNode = (nodeId: string) => {
  if (graph) {
    selectNodeFn(graph, nodeId, moteStore)
  }
}

/**
 * 渲染图形
 */
const renderGraph = () => {
  if (graph) {
    renderGraphFn(graph, moteStore.moteTree)
  }
}

// ==================== 监听器 ====================
watch(zoom, (val) => {
  if (graph) {
    graph.zoomTo(val)
  }
})

// 监听数据变化，重新渲染图形并同步更新选中节点的标签
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

// 监听选中节点变化
watch(
  () => moteStore.selectedNodeLabel,
  () => {
    if (!moteStore.isEditing) {
      moteStore.editingNodeText = ''
    }
  },
)

watch(
  () => moteStore.selectedNodeId,
  (newNodeId) => {
    if (newNodeId && !moteStore.isEditing) {
      moteStore.editingNodeText = ''
    }
  },
)

// ==================== 生命周期 ====================
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

/* 卡片样式优化 */
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

/* 按钮样式优化 */
:deep(.ant-btn-circle) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

/* 大尺寸按钮图标优化 */
:deep(.ant-btn-lg) {
  .anticon {
    font-size: 18px;
  }
}

/* 输入框样式优化 */
:deep(.ant-input),
:deep(.ant-input-textarea) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;

  &:focus {
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15);
    border-color: #1890ff;
  }

  &:hover {
    border-color: #40a9ff;
  }
}

:deep(.ant-input-textarea) {
  .ant-input {
    resize: none;
    border: none;
    box-shadow: none;

    &:focus {
      box-shadow: none;
    }
  }
}

/* 工具提示样式 */
:deep(.ant-tooltip) {
  font-size: 13px;
}

/* 文本区域样式优化 */
:deep(.ant-input-textarea) {
  .ant-input {
    font-size: 14px;
    line-height: 1.6;
    transition: all 0.2s ease;
  }

  /* 未聚焦时的样式 */
  &:not(:focus-within) {
    .ant-input {
      resize: none;
      overflow: hidden;
    }
  }

  /* 聚焦时的样式 */
  &:focus-within {
    .ant-input {
      resize: none;
    }
  }
}
</style>
