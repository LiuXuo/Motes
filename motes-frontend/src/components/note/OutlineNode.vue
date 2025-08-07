<template>
  <div class="outline-node">
    <!-- 节点内容 -->
    <div
      class="node-content"
      :data-node-id="props.node.id"
      :class="{
        selected: isSelected(props.node.id, props.selectedNodeId),
        'has-children': hasChildren(props.node),
        collapsed: props.node.collapsed,
        'first-level': props.level === 1,
      }"
      @click="handleNodeClick(props.node.id)"
    >
      <!-- 展开/折叠图标 -->
      <div
        v-if="hasChildren(props.node)"
        class="toggle-icon"
        @click.stop="handleNodeToggle(props.node.id)"
      >
        <CaretDownOutlined class="toggle-arrow" />
      </div>
      <div v-else class="toggle-placeholder">
        <svg class="circle-icon" viewBox="0 0 12 12" width="12" height="12">
          <circle cx="6" cy="6" r="2.5" fill="#666" />
        </svg>
      </div>

      <!-- 节点文本 -->
      <div v-if="!isEditing" class="node-text">
        {{ props.node.text }}
      </div>

      <!-- 编辑输入框 -->
      <textarea
        v-else
        ref="editInput"
        v-model="editText"
        class="edit-input"
        @blur="handleEditBlur"
        @keydown.esc="handleEditCancel"
        @input="handleEditTextChange"
        @click.stop
        rows="1"
        wrap="soft"
      />
    </div>

    <!-- 子节点 - 添加过渡动画 -->
    <Transition name="children-expand" @enter="onEnter" @leave="onLeave">
      <div v-if="hasChildren(props.node) && !props.node.collapsed" class="children-container">
        <OutlineNode
          v-for="child in props.node.children"
          :key="child.id"
          :node="child"
          :selected-node-id="props.selectedNodeId"
          :level="props.level + 1"
          @node-click="handleNodeClick"
          @node-toggle="handleNodeToggle"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue'
import { ref, nextTick, watch } from 'vue'
import { useMoteStore } from '@/stores/moteStore'

// ==================== 类型定义 ====================
interface MoteTree {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteTree[]
}

// ==================== Props 定义 ====================
interface Props {
  node: MoteTree
  selectedNodeId: string
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  'node-click': [nodeId: string]
  'node-toggle': [nodeId: string]
}>()

// ==================== Store ====================
const moteStore = useMoteStore()

// ==================== 编辑状态 ====================
const isEditing = ref(false)
const editText = ref('')
const editInput = ref<HTMLTextAreaElement>()

// 监听编辑状态变化，当进入编辑状态时自动聚焦并全选
watch(
  () => moteStore.isEditing,
  (newIsEditing) => {
    // 如果当前节点被选中且进入编辑状态
    if (newIsEditing && props.selectedNodeId === props.node.id) {
      isEditing.value = true
      editText.value = props.node.text

      nextTick(() => {
        if (editInput.value) {
          editInput.value.focus()
          editInput.value.select()
          adjustTextareaHeight()
        }
      })
    } else if (!newIsEditing) {
      // 如果退出编辑状态，同步退出本地编辑状态
      isEditing.value = false
    }
  },
)

// ==================== 辅助函数 ====================
const hasChildren = (node: MoteTree) => {
  return node.children && node.children.length > 0
}

const isSelected = (nodeId: string, selectedId: string) => {
  return selectedId === nodeId
}

// ==================== 过渡动画处理 ====================
const onEnter = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = '0'
  target.style.overflow = 'hidden'

  // 强制重排以获取实际高度
  void target.offsetHeight

  // 设置目标高度
  const height = target.scrollHeight
  target.style.height = height + 'px'

  // 动画结束后清理样式
  setTimeout(() => {
    target.style.height = ''
    target.style.overflow = ''
  }, 300)
}

const onLeave = (el: Element) => {
  const target = el as HTMLElement
  const height = target.scrollHeight
  target.style.height = height + 'px'
  target.style.overflow = 'hidden'

  // 强制重排
  void target.offsetHeight

  // 设置高度为0
  target.style.height = '0'
}

// ==================== 事件处理 ====================
const handleNodeClick = (nodeId: string) => {
  // 如果点击的是已选中的节点，进入编辑状态
  if (props.selectedNodeId === nodeId && !isEditing.value) {
    // 检查是否点击的是折叠/展开按钮
    const event = window.event as MouseEvent
    const target = event?.target as HTMLElement
    if (target?.closest('.toggle-icon')) {
      return // 如果点击的是折叠/展开按钮，不进入编辑状态
    }

    // 进入编辑状态
    isEditing.value = true
    editText.value = props.node.text

    // 等待 DOM 更新后聚焦输入框并自动全选
    nextTick(() => {
      if (editInput.value) {
        editInput.value.focus()
        // 全选内容
        editInput.value.select()
        // 调整高度
        adjustTextareaHeight()
      }
    })
  } else {
    // 如果点击的是新节点，选中该节点
    emit('node-click', nodeId)
  }
}

const handleNodeToggle = (nodeId: string) => {
  emit('node-toggle', nodeId)
}

const handleEditConfirm = () => {
  if (editText.value.trim() !== '') {
    // 使用 moteStore 的 editNodeText 函数
    moteStore.editNodeText(props.node.id, editText.value.trim())
  }
  // 同步更新 store 中的编辑状态
  moteStore.resetEditingState()
  isEditing.value = false
}

const handleEditBlur = () => {
  handleEditConfirm()
}

const handleEditCancel = () => {
  // 取消编辑，恢复原文本
  editText.value = props.node.text
  // 同步更新 store 中的编辑状态
  moteStore.resetEditingState()
  isEditing.value = false
}

// ==================== 自动调整高度 ====================
const adjustTextareaHeight = () => {
  if (editInput.value) {
    editInput.value.style.height = 'auto'
    editInput.value.style.height = editInput.value.scrollHeight + 'px'
  }
}

// 监听编辑文本变化，自动调整高度
const handleEditTextChange = () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
}
</script>

<style scoped lang="less">
.outline-node {
  .node-content {
    display: flex;
    align-items: center;
    padding: 8px 16px 8px 30px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-left none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    &:hover {
      background-color: #eeeeee;
    }

    &.selected {
      background-color: #eff4ff;
      border-left: 2px solid #5f95ff;
      margin-left: -2px;
    }

    &.collapsed {
      .toggle-icon .toggle-arrow {
        transform: rotate(-90deg);
      }
    }

    &.first-level {
      .node-text {
        margin: 0;
        font-size: 30px;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .toggle-icon,
  .toggle-placeholder {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    margin-left: -18px;
    cursor: pointer;
  }

  .toggle-icon {
    color: #666;

    &:hover {
      color: #5f95ff;
    }

    .toggle-arrow {
      transition: transform 0.2s ease;
      font-size: 12px;
    }
  }

  .toggle-placeholder {
    .circle-icon {
      transition: fill 0.2s ease;
      fill: #666;
    }

    &:hover .circle-icon {
      fill: #5f95ff;
    }
  }

  .node-text {
    flex: 1;
    word-break: break-word;
    line-height: 1.5;
    font-size: 16px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .edit-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    line-height: 1.5;
    font-family: inherit;
    padding: 0;
    margin: 0;
    color: inherit;
    resize: none;
    overflow: hidden;
    min-height: 1.5em;
    max-height: 6em;
    word-wrap: break-word;
    white-space: pre-wrap;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;

    &:focus {
      background-color: #ffffff;
      border: 1px solid #5f95ff;
      border-radius: 4px;
      padding: 2px 4px;
      margin: -2px -4px;
    }
  }

  .children-container {
    margin-left: 20px;
    border-left: 2px solid #e8e8e8;
  }

  // 子节点展开/折叠动画
  .children-expand-enter-active,
  .children-expand-leave-active {
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .children-expand-enter-from {
    height: 0;
  }

  .children-expand-leave-to {
    height: 0;
  }
}
</style>
