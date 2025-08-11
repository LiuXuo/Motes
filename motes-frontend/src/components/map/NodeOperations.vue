<template>
  <div class="button-grid">
    <a-tooltip v-for="operation in nodeOperations" :key="operation.action" :title="operation.title">
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
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import type { Component } from 'vue'
import { useMoteStore } from '@/stores/moteStore'

// ==================== 类型定义 ====================
interface MoteTree {
  id: string
  text: string
  collapsed: boolean
  parentId: string
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
} from '@ant-design/icons-vue'

// ==================== 类型定义 ====================
interface NodeOperation {
  action: string
  title: string
  shortcut: string
  icon: Component
  disabled?: (nodeId: string, store: ReturnType<typeof useMoteStore>) => boolean
  method: (nodeId: string, store: ReturnType<typeof useMoteStore>) => string | void
}

// ==================== Props & Emits ====================
interface Props {
  moteStore: ReturnType<typeof useMoteStore>
  renderGraph: () => void
  selectNode: (nodeId: string) => void
}

const props = defineProps<Props>()

// ==================== 节点操作配置 ====================
const nodeOperations: NodeOperation[] = [
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

// ==================== 节点操作处理 ====================
/**
 * 执行节点操作并处理结果的通用函数
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
/* 按钮网格布局 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  justify-items: center;
}

/* 与 Ant Design 的通用覆写已移至全局样式 */
</style>
