<template>
  <a-modal
    v-model:open="openValue"
    :title="title"
    :okText="okText"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-tree
      :show-line="true"
      :show-icon="true"
      :default-expand-all="true"
      :selected-keys="selectedKeys"
      :tree-data="filteredFolders"
      block-node
      class="doc-tree-modal-tree"
      @select="onSelect"
    >
      <template #icon>
        <FolderOpenOutlined />
      </template>
      <template #title="{ dataRef }">
        <span>{{ dataRef.title || '根目录' }}</span>
      </template>
    </a-tree>
  </a-modal>
</template>

<script setup   lang="ts">
import { computed, ref, watch } from 'vue'
import { FolderOpenOutlined } from '@ant-design/icons-vue'
import { useDocStore, type DocNode } from '@/stores/docStore'

interface Props {
  open?: boolean
  title?: string
  okText?: string
  confirmLoading?: boolean
  excludeSubtreeRootKey?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', folderKey: string): void
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

const openValue = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val),
})

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

const filteredFolders = computed(() => {
  const root = docStore.docTree
  const filteredRoot = filterFolderNodes(root)
  // a-tree 需要数组作为 treeData，包含根节点，便于选择根目录
  return filteredRoot ? [filteredRoot] : []
})

function onSelect(keys: string[]) {
  selectedKeys.value = keys
}

function handleOk() {
  const key = selectedKeys.value[0]
  if (key) {
    emit('confirm', key)
    emit('update:open', false)
  }
}

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


