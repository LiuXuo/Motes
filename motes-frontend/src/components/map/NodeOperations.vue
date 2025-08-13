<!--
  节点操作按钮组件

  主要功能：
  - 提供节点的基础操作按钮（增删改查）
  - 集成 AI 生枝功能
  - 支持键盘快捷键操作
  - 根据节点状态动态禁用按钮

  Props:
  - moteStore: 脑图状态管理 Store
  - renderGraph: 重新渲染图形的函数
  - selectNode: 选中节点的函数
-->
<template>
  <div class="node-operations">
    <!-- 原有的8个按钮网格 -->
    <div class="button-grid">
      <a-tooltip v-for="operation in basicOperations" :key="operation.action" :title="operation.title">
        <a-button
          type="default"
          shape="circle"
          size="large"
          :danger="operation.action === 'delete'"
          @click="executeNodeOperation(operation)"
          :disabled="operation.disabled?.(moteStore.selectedNodeId, moteStore)"
        >
          <template #icon>
            <component :is="operation.icon" />
          </template>
        </a-button>
      </a-tooltip>
    </div>

    <!-- AI生枝按钮 - 宽度100% -->
    <div class="ai-expand-section">
      <a-tooltip :title="aiExpandOperation.title">
        <a-button
          type="default"
          size="large"
          class="ai-expand-button"
          @click="executeNodeOperation(aiExpandOperation)"
          :disabled="aiExpandOperation.disabled?.(moteStore.selectedNodeId, moteStore)"
          :loading="aiStore.isAiExpanding"
        >
          <template #icon>
            <component :is="aiExpandOperation.icon" />
          </template>
          {{ aiExpandOperation.title }}
        </a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import type { Component } from 'vue'
import { useMoteStore } from '@/stores/moteStore'
import { useAiStore } from '@/stores/aiStore'

// ==================== 类型定义 ====================
/**
 * 脑图树节点接口
 *
 * 定义脑图树中每个节点的数据结构
 */
interface MoteTree {
  /** 节点唯一标识符 */
  id: string
  /** 节点文本内容 */
  text: string
  /** 节点是否折叠（隐藏子节点） */
  collapsed: boolean
  /** 父节点ID，根节点为空字符串 */
  parentId: string
  /** 子节点数组，可选 */
  children?: MoteTree[]
}

import {
  PlusCircleOutlined,
  PlusSquareOutlined,
  DeleteOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  MenuUnfoldOutlined,
  BranchesOutlined,
} from '@ant-design/icons-vue'

/**
 * 节点操作配置接口
 *
 * 定义每个操作按钮的配置信息
 */
interface NodeOperation {
  /** 操作类型标识 */
  action: string
  /** 操作标题 */
  title: string
  /** 快捷键说明 */
  shortcut: string
  /** 操作图标组件 */
  icon: Component
  /** 禁用条件函数 */
  disabled?: (nodeId: string, store: ReturnType<typeof useMoteStore>) => boolean
  /** 执行操作的方法 */
  method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => string | void
}

// ==================== Props & Emits ====================
/**
 * 组件属性接口
 *
 * 定义组件接收的外部参数
 */
interface Props {
  /** 脑图状态管理 Store */
  moteStore: ReturnType<typeof useMoteStore>
  /** 重新渲染图形的函数 */
  renderGraph: () => void
  /** 选中节点的函数 */
  selectNode: (nodeId: string) => void
}

const props = defineProps<Props>()

/**
 * AI 状态管理 Store
 *
 * 管理 AI 相关功能的状态
 */
const aiStore = useAiStore()

// ==================== 节点操作配置 ====================
/**
 * 基础操作配置数组
 *
 * 包含8个基础节点操作按钮的配置：
 * - 新增子节点
 * - 新增同级节点
 * - 删除节点
 * - 展开/折叠节点
 * - 升级节点
 * - 降级节点
 * - 上移节点
 * - 下移节点
 */
const basicOperations: NodeOperation[] = [
  {
    action: 'addChild',
    title: '新增子节点(Enter)',
    shortcut: 'Enter',
    icon: PlusCircleOutlined,
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.addChildNode(nodeId),
  },
  {
    action: 'addSibling',
    title: '新增同级节点(Shift+Enter)',
    shortcut: 'Shift+Enter',
    icon: PlusSquareOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.canAddSibling(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      store.addSiblingNode(nodeId),
  },
  {
    action: 'delete',
    title: '删除节点(Delete)',
    shortcut: 'Delete',
    icon: DeleteOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.canDeleteNode(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.deleteNode(nodeId),
  },
  {
    action: 'toggleCollapse',
    title: '展开/折叠(Alt+.)',
    shortcut: 'Alt+.',
    icon: MenuUnfoldOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.hasChildren(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      store.toggleNodeCollapse(nodeId),
  },
  {
    action: 'promote',
    title: '升级节点(Ctrl+Left)',
    shortcut: 'Ctrl+Left',
    icon: LeftCircleOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.canProMoteNode(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.proMoteNode(nodeId),
  },
  {
    action: 'demote',
    title: '降级节点(Ctrl+Right)',
    shortcut: 'Ctrl+Right',
    icon: RightCircleOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.canDeMoteNode(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.deMoteNode(nodeId),
  },
  {
    action: 'moveUp',
    title: '上移节点(Ctrl+Up)',
    shortcut: 'Ctrl+Up',
    icon: UpCircleOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) => !store.canMoveUp(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.moveNodeUp(nodeId),
  },
  {
    action: 'moveDown',
    title: '下移节点(Ctrl+Down)',
    shortcut: 'Ctrl+Down',
    icon: DownCircleOutlined,
    disabled: (nodeId: string, store: ReturnType<typeof useMoteStore>) =>
      !store.canMoveDown(nodeId),
    method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => store.moveNodeDown(nodeId),
  },
]

/**
 * AI生枝操作配置
 *
 * 配置 AI 生枝功能的按钮和操作
 */
const aiExpandOperation: NodeOperation = {
  action: 'aiExpand',
  title: 'AI生枝(Ctrl+E)',
  shortcut: 'Ctrl+E',
  icon: BranchesOutlined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disabled: (nodeId: string, _store: ReturnType<typeof useMoteStore>) =>
    !nodeId || aiStore.isAiExpanding,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  method: (nodeId: string, _store: ReturnType<typeof useMoteStore>) => {
    aiStore.openAiExpandModal(nodeId);
  }
}

// ==================== 节点操作处理 ====================
/**
 * 执行节点操作并处理结果的通用函数
 *
 * 根据操作类型执行相应的节点操作，并在操作完成后：
 * - 重新渲染图形
 * - 选择合适的节点进行选中
 * - 处理删除操作的特殊逻辑
 *
 * @param {NodeOperation} operation - 要执行的操作配置
 *
 * @example
 * executeNodeOperation(basicOperations[0]) // 执行新增子节点操作
 *
 * @throws {Error} 当操作执行失败时
 */
const executeNodeOperation = async (operation: NodeOperation) => {
  if (!props.moteStore.selectedNodeId) return

  try {
    // 对于删除操作，需要在删除前保存节点信息
    let nodeToSelect = props.moteStore.selectedNodeId
    let parentNode: MoteTree | null = null
    let currentIndex = -1
    let siblings: MoteTree[] = []

    if (operation.action === 'delete') {
      // 删除前先获取父节点和兄弟节点信息
      const res = props.moteStore.findNodeAndParent(
        props.moteStore.selectedNodeId,
      )
      parentNode = res?.parent || null

      if (parentNode) {
        siblings = (parentNode.children || []).filter(
          (node: MoteTree) => node.id !== props.moteStore.selectedNodeId,
        )
        currentIndex = (parentNode.children || []).findIndex(
          (node: MoteTree) => node.id === props.moteStore.selectedNodeId,
        )
      }
    }

    const result = operation.method(props.moteStore.selectedNodeId, props.moteStore)
    props.renderGraph()

    // 根据操作类型决定选中哪个节点
    if (operation.action === 'delete') {
      // 删除操作需要特殊处理选中逻辑
      if (parentNode) {
        if (siblings.length === 0) {
          nodeToSelect = parentNode.id
        } else {
          let targetIndex = currentIndex
          if (targetIndex >= siblings.length) {
            targetIndex = siblings.length - 1
          }
          if (targetIndex >= 0 && targetIndex < siblings.length) {
            nodeToSelect = siblings[targetIndex].id
          } else {
            nodeToSelect = parentNode.id
          }
        }
      }
    } else if (operation.action === 'addChild') {
      // 新增子节点后选中新节点
      const res = props.moteStore.findNodeAndParent(result as string)
      nodeToSelect = res?.node?.id || props.moteStore.selectedNodeId
    } else if (operation.action === 'addSibling') {
      // 新增同级节点后选中新节点
      nodeToSelect = result as string
    }

    nextTick(() => {
      props.selectNode(nodeToSelect)
    })
  } catch (error) {
    console.error(`${operation.title}失败:`, error)
  }
}
</script>

<style scoped lang="less">
.node-operations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮网格布局 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  justify-items: center;
}

/* AI生枝按钮区域 */
.ai-expand-section {
  width: 100%;
}

.ai-expand-button {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 50px; /* 最大圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 和其他按钮一样的投影 */
  background: #ffffff; /* 保持白色背景 */
  border: 1px solid #d9d9d9; /* 保持默认边框颜色 */
  color: rgba(0, 0, 0, 0.88); /* 保持默认文字颜色 */
  transition: all 0.2s ease; /* 平滑过渡动画 */
}

.ai-expand-button:hover {
  border-color: #4096ff; /* 悬停时的边框颜色 */
  color: #4096ff; /* 悬停时的文字颜色 */
  transform: translateY(-1px); /* 轻微向上移动 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 增强投影效果 */
  transition: all 0.2s ease; /* 平滑过渡动画 */
}

.ai-expand-button:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: rgba(0, 0, 0, 0.25);
  box-shadow: none;
}

/* 与 Ant Design 的通用覆写已移至全局样式 */
</style>
