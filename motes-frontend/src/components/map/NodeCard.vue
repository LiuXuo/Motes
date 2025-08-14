<!--
  节点操作卡片组件

  主要功能：
  - 显示选中节点的详细信息
  - 提供节点文本编辑功能
  - 集成节点操作按钮
  - 显示操作快捷键说明

  Props:
  - moteStore: 脑图状态管理 Store
  - renderGraph: 重新渲染图形的函数
  - selectNode: 选中节点的函数

  Events:
  - updateEditingText: 更新编辑文本
  - updateIsEditing: 更新编辑状态
  - startEditing: 开始编辑
  - handleTextConfirm: 确认文本编辑
-->
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
          {{ t('NodeCardVue.nodeId') }}: {{ moteStore.selectedNodeId }}
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
        <div>{{ t('NodeCardVue.shortcuts.clickNode') }}</div>
        <div>{{ t('NodeCardVue.shortcuts.clickToEdit') }}</div>
        <div>{{ t('NodeCardVue.shortcuts.clickBlank') }}</div>
        <div>{{ t('NodeCardVue.shortcuts.arrowKeys') }}</div>
      </div>
    </a-card>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMoteStore } from '@/stores/moteStore'
import NodeOperations from './NodeOperations.vue'

const { t } = useI18n()

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
 * 组件事件定义
 *
 * 定义组件向父组件发送的事件
 */
const emit = defineEmits<{
  /** 更新编辑文本事件 */
  updateEditingText: [text: string]
  /** 更新编辑状态事件 */
  updateIsEditing: [isEditing: boolean]
  /** 开始编辑事件 */
  startEditing: []
  /** 确认文本编辑事件 */
  handleTextConfirm: []
}>()

// ==================== 本地状态 ====================
/**
 * 本地编辑文本状态
 *
 * 用于同步 store 中的编辑文本，避免直接修改 store 状态
 */
const localEditingText = ref('')

/**
 * 文本域引用
 *
 * 用于操作文本域元素，如聚焦、选择等
 */
const textareaRef = ref<HTMLTextAreaElement>()

/**
 * 同步 store 中的编辑文本到本地状态
 *
 * 监听 store 中编辑文本的变化，同步到本地状态
 */
watch(
  () => props.moteStore.editingNodeText,
  (newText) => {
    localEditingText.value = newText
  },
  { immediate: true },
)

/**
 * 同步本地编辑文本到 store
 *
 * 当处于编辑状态时，将本地文本变化同步到 store
 */
watch(
  () => localEditingText.value,
  (newText) => {
    if (props.moteStore.isEditing) {
      emit('updateEditingText', newText)
    }
  },
)

/**
 * 监听编辑状态变化，自动聚焦输入框
 *
 * 当进入编辑状态时，自动聚焦到文本域并选择全部内容
 * 使用多次尝试机制确保聚焦成功
 */
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
/**
 * 卡片样式计算属性
 *
 * 根据组件状态计算卡片的样式，包括位置、大小、阴影等
 *
 * @returns {object} 卡片样式对象
 */
const cardStyle = computed(() => ({
  position: 'absolute',
  bottom: '40px',
  right: '40px',
  zIndex: 1000,
  minWidth: '200px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  borderRadius: '12px',
}))

/**
 * 文本域样式计算属性
 *
 * 根据编辑状态计算文本域的样式，包括边框颜色等
 *
 * @returns {object} 文本域样式对象
 */
const textareaStyle = computed(() => ({
  border: props.moteStore.isEditing ? '1px solid #1890ff' : '1px solid #d9d9d9',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'all 0.2s ease',
}))

// ==================== 编辑相关函数 ====================
/**
 * 处理文本域聚焦事件
 *
 * 当文本域获得焦点时，触发开始编辑事件
 */
const handleTextFocus = () => {
  emit('startEditing')
}

/**
 * 处理文本域失焦事件
 *
 * 当文本域失去焦点且不在编辑状态时，清空本地编辑文本
 */
const handleTextBlur = () => {
  setTimeout(() => {
    if (!props.moteStore.isEditing) {
      localEditingText.value = ''
    }
  }, 200)
}

/**
 * 处理文本确认事件
 *
 * 确认文本编辑，更新 store 中的文本并重新渲染图形
 * 延迟执行以确保状态更新完成
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleTextConfirm = () => {
  // 通过 emit 更新编辑文本
  emit('updateEditingText', localEditingText.value)
  emit('handleTextConfirm')
  props.renderGraph()
  nextTick(() => {
    props.selectNode(props.moteStore.selectedNodeId)
  })
}

/**
 * 处理文本取消事件
 *
 * 取消文本编辑，恢复原始文本并退出编辑状态
 *
 * @param {KeyboardEvent} event - 键盘事件对象
 */
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
