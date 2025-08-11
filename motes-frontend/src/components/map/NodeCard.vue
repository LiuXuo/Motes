<template>
  <transition name="fade-slide" appear>
    <a-card v-if="moteStore.selectedNodeId" :style="cardStyle" size="default">
      <!-- 节点文本编辑区域 -->
      <div style="margin-bottom: 20px">
        <a-textarea
          ref="textareaRef"
          v-model:value="localEditingText"
          :placeholder="moteStore.selectedNodeLabel"
          :maxlength="100"
          show-count
          :auto-size="{
            minRows: moteStore.isEditing ? 2 : 1,
            maxRows: moteStore.isEditing ? 10 : 1,
          }"
          @focus="handleTextFocus"
          @blur="handleTextBlur"
          @keydown.esc="handleTextCancel"
          :style="textareaStyle"
          tabindex="0"
        />
        <!-- 节点ID显示 -->
        <div style="font-size: 12px; color: #999; text-align: left">
          ID: {{ moteStore.selectedNodeId }}
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <NodeOperations
        :mote-store="moteStore"
        :render-graph="renderGraph"
        :select-node="selectNode"
      />

      <!-- 导航快捷键说明 -->
      <div class="shortcut-help">
        <div>单击节点选中</div>
        <div>点击选中节点编辑</div>
        <div>点击空白处取消选中</div>
        <div>方向键移动所选节点</div>
      </div>
    </a-card>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useMoteStore } from '@/stores/moteStore'
import NodeOperations from './NodeOperations.vue'

// ==================== Props & Emits ====================
interface Props {
  moteStore: ReturnType<typeof useMoteStore>
  renderGraph: () => void
  selectNode: (nodeId: string) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateEditingText: [text: string]
  updateIsEditing: [isEditing: boolean]
  startEditing: []
  handleTextConfirm: []
}>()

// ==================== 本地状态 ====================
const localEditingText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 同步 store 中的编辑文本到本地状态
watch(
  () => props.moteStore.editingNodeText,
  (newText) => {
    localEditingText.value = newText
  },
  { immediate: true },
)

// 同步本地编辑文本到 store
watch(
  () => localEditingText.value,
  (newText) => {
    if (props.moteStore.isEditing) {
      props.moteStore.editingNodeText = newText
    }
  },
)

// 监听编辑状态变化，自动聚焦输入框
watch(
  () => props.moteStore.isEditing,
  (isEditing) => {
    if (isEditing) {
      // 多次尝试聚焦，确保输入框能够获得焦点
      const focusTextarea = () => {
        if (textareaRef.value) {
          console.log('聚焦输入框:', textareaRef.value)
          textareaRef.value.focus()
          textareaRef.value.select()
          return true
        } else {
          console.log('输入框引用不存在')
          return false
        }
      }

      // 立即尝试
      nextTick(() => {
        if (!focusTextarea()) {
          // 如果立即尝试失败，延迟后再次尝试
          setTimeout(() => {
            if (!focusTextarea()) {
              // 再次延迟尝试
              setTimeout(() => {
                focusTextarea()
              }, 200)
            }
          }, 100)
        }
      })
    }
  },
)

// ==================== 计算属性 ====================
const cardStyle = computed(() => ({
  position: 'absolute',
  bottom: '40px',
  right: '40px',
  zIndex: 1000,
  minWidth: '200px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  borderRadius: '12px',
}))

const textareaStyle = computed(() => ({
  border: props.moteStore.isEditing ? '1px solid #1890ff' : '1px solid #d9d9d9',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'all 0.2s ease',
}))

// ==================== 编辑相关函数 ====================
const handleTextFocus = () => {
  emit('startEditing')
}

const handleTextBlur = () => {
  setTimeout(() => {
    if (!props.moteStore.isEditing) {
      localEditingText.value = ''
    }
  }, 200)
}

const handleTextConfirm = () => {
  // 通过 emit 更新编辑文本
  emit('updateEditingText', localEditingText.value)
  emit('handleTextConfirm')
  props.renderGraph()
  nextTick(() => {
    props.selectNode(props.moteStore.selectedNodeId)
  })
}

const handleTextCancel = () => {
  localEditingText.value = props.moteStore.originalText
  // 通过 emit 更新编辑状态
  emit('updateIsEditing', false)
  setTimeout(() => {
    localEditingText.value = ''
  }, 100)
}
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
