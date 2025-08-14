<!--
  文档树选择弹窗组件

  主要功能：
  - 显示文档树结构供用户选择
  - 支持文件夹选择（用于移动操作）
  - 排除指定子树（防止循环移动）
  - 默认展开所有节点
  - 支持根目录选择

  Props:
  - open: 弹窗显示状态
  - title: 弹窗标题
  - okText: 确认按钮文本
  - confirmLoading: 确认按钮加载状态
  - excludeSubtreeRootKey: 排除的子树根节点键值

  Events:
  - update:open: 弹窗状态变化事件
  - confirm: 确认选择事件
  - cancel: 取消事件
-->
<template>
  <a-modal
    v-model:open="openValue"
    :title="title || t('DocTreeModalVue.defaultTitle')"
    :okText="okText || t('DocTreeModalVue.buttons.confirm')"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-tree
      :show-line="true"
      :default-expand-all="true"
      :selected-keys="selectedKeys"
      :tree-data="filteredFolders"
      block-node
      class="doc-tree-modal-tree"
      @select="onSelect"
    >
      <template #title="{ dataRef }">
        <span>{{ dataRef.title || t('common.root') }}</span>
      </template>
    </a-tree>
  </a-modal>
</template>

<script setup   lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDocStore, type DocNode } from '@/stores/docStore'

const { t } = useI18n()

/**
 * 组件属性接口
 *
 * 定义文档树选择弹窗的输入属性，
 * 控制弹窗的显示和行为。
 *
 * @interface Props
 */
interface Props {
  /** 弹窗显示状态 */
  open?: boolean
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文本 */
  okText?: string
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 排除的子树根节点键值，防止循环移动 */
  excludeSubtreeRootKey?: string
}

/**
 * 组件事件接口
 *
 * 定义文档树选择弹窗触发的事件，
 * 用于与父组件通信。
 *
 * @interface Emits
 */
interface Emits {
  /** 弹窗状态变化事件 */
  (e: 'update:open', value: boolean): void
  /** 确认选择事件，传递选中的文件夹键值 */
  (e: 'confirm', folderKey: string): void
  /** 取消事件 */
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '选择目标文件夹',
  okText: '确定',
  confirmLoading: false,
})
const emit = defineEmits<Emits>()

const docStore = useDocStore()

/**
 * 弹窗显示状态计算属性
 *
 * 双向绑定弹窗的显示状态，
 * 支持v-model语法糖。
 *
 * @type {ComputedRef<boolean>}
 */
const openValue = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val),
})

/**
 * 选中的节点键值数组
 *
 * 记录当前在树形组件中选中的节点键值。
 *
 * @type {Ref<string[]>}
 */
const selectedKeys = ref<string[]>([])

watch(
  () => props.open,
  async (v) => {
    if (v) {
      if (!docStore.isInitialized && !docStore.isLoading) {
        await docStore.fetchDocTree()
      }
      // 默认选中根目录
      if (docStore.docTree.key) {
        selectedKeys.value = [docStore.docTree.key]
      }
    }
  },
  { immediate: false },
)

/**
 * 过滤文件夹节点
 *
 * 递归过滤文档树，只保留文件夹节点，
 * 同时排除已删除的节点和指定的子树。
 *
 * @param {DocNode} node - 要过滤的节点
 * @returns {DocNode | null} 过滤后的节点，如果不是文件夹则返回null
 *
 * @example
 * const filteredNode = filterFolderNodes(docNode)
 * // 返回只包含文件夹的节点树
 */
function filterFolderNodes(node: DocNode): DocNode | null {
  if (node.isDeleted) return null
  const isFolder = node.type === 'folder' || node.key === docStore.docTree.key
  // 排除指定子树（防止将节点移动到自身或其子层级）
  if (props.excludeSubtreeRootKey && node.key === props.excludeSubtreeRootKey) {
    return null
  }
  if (!isFolder) return null
  const children = (node.children || [])
    .map(child => filterFolderNodes(child))
    .filter(Boolean) as DocNode[]
  return { ...node, children }
}

/**
 * 过滤后的文件夹树计算属性
 *
 * 根据当前文档树生成只包含文件夹的树形结构，
 * 用于在弹窗中显示可选择的文件夹。
 *
 * @type {ComputedRef<DocNode[]>}
 *
 * @example
 * // 返回过滤后的文件夹树数组
 * const folders = filteredFolders.value
 */
const filteredFolders = computed(() => {
  const root = docStore.docTree
  const filteredRoot = filterFolderNodes(root)
  // a-tree 需要数组作为 treeData，包含根节点，便于选择根目录
  return filteredRoot ? [filteredRoot] : []
})

/**
 * 处理树节点选择事件
 *
 * 当用户在树形组件中选择节点时，
 * 更新选中的节点键值数组。
 *
 * @param {string[]} keys - 选中的节点键值数组
 *
 * @example
 * onSelect(['folder123'])
 * // 更新 selectedKeys 为 ['folder123']
 */
function onSelect(keys: string[]) {
  selectedKeys.value = keys
}

/**
 * 处理确认按钮点击事件
 *
 * 当用户点击确认按钮时，触发confirm事件，
 * 传递选中的文件夹键值并关闭弹窗。
 *
 * @returns {void}
 *
 * @example
 * handleOk()
 * // 触发: confirm('folder123') 和 update:open(false)
 */
function handleOk() {
  const key = selectedKeys.value[0]
  if (key) {
    emit('confirm', key)
    emit('update:open', false)
  }
}

/**
 * 处理取消按钮点击事件
 *
 * 当用户点击取消按钮时，触发cancel事件并关闭弹窗。
 *
 * @returns {void}
 *
 * @example
 * handleCancel()
 * // 触发: cancel() 和 update:open(false)
 */
function handleCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>

<style scoped>
.doc-tree-modal-tree {
  max-height: 50vh;
  overflow: auto;
}
</style>


