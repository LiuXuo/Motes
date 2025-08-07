<template>
  <div class="app-mote">
    <!-- 视图内容区域 -->
    <div class="view-container">
      <!-- 思维导图视图 -->
      <Transition name="fade" mode="out-in">
        <MapRender v-if="moteStore.viewMode === 'map'" key="map" />
      </Transition>

      <!-- 大纲笔记视图 -->
      <Transition name="fade" mode="out-in">
        <NoteRender v-if="moteStore.viewMode === 'note'" key="note" />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useMoteStore } from '@/stores/moteStore'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import MapRender from '@/components/map/MapRender.vue'
import NoteRender from '@/components/note/NoteRender.vue'

// ==================== 路由参数 ====================
const route = useRoute()
const router = useRouter()
const moteId = route.params.moteId as string

// ==================== 状态管理 ====================
const moteStore = useMoteStore()

// ==================== 自动保存功能 ====================
let autoSaveTimer: number | null = null

// 键盘事件处理函数
const handleKeyDown = (event: KeyboardEvent) => {
  // 监听 Ctrl+S 快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // 阻止浏览器默认的保存行为
    saveDocumentWithMessage()
  }
}

// 通用保存函数
const saveDocumentWithMessage = async () => {
  if (!moteStore.isDirty) {
    return true // 没有修改，无需保存
  }

  try {
    const success = await moteStore.saveDocument()
    if (success) {
      message.success('文档已保存')
      return true
    } else {
      message.error('保存失败')
      return false
    }
  } catch (error) {
    message.error('保存过程中发生错误')
    return false
  }
}

// 自动保存函数
const autoSave = async () => {
  await saveDocumentWithMessage()
}

// 启动自动保存定时器
const startAutoSave = () => {
  // 清除可能存在的旧定时器
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }

  // 设置每分钟自动保存（60000毫秒 = 1分钟）
  autoSaveTimer = setInterval(autoSave, 60000)
}

// 停止自动保存定时器
const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

// ==================== 路由监听 ====================
// 监听路由变化，处理文档保存和切换
watch(
  () => route.path,
  async (newPath, oldPath) => {
    // 如果路由路径发生变化
    if (newPath !== oldPath) {
      // 保存当前文档（如果有修改）
      await saveDocumentWithMessage()

      // 如果新路由仍然是mote路由，则加载新文档的数据
      if (newPath.startsWith('/mote/')) {
        const newMoteId = route.params.moteId as string
        if (newMoteId) {
          try {
            const success = await moteStore.loadMoteData(newMoteId)
            if (!success) {
              message.error('加载脑图数据失败')
            }
          } catch (error: any) {
            if (error.name === 'NOT_FOUND') {
              message.error(error.message || '脑图笔记不存在')
              // 重定向到404页面
              router.push('/404')
            } else {
              message.error('加载脑图数据失败')
            }
          }
        }
      }
    }
  },
  { immediate: false }, // 不立即执行，避免初始化时触发
)

// ==================== 路由离开守卫 ====================
onBeforeRouteLeave(async (to, from, next) => {
  // 如果文档有修改，保存文档
  if (moteStore.isDirty) {
    try {
      const success = await moteStore.saveDocument()
      if (success) {
        message.success('文档已保存')
      } else {
        message.error('保存失败')
      }
    } catch (error) {
      message.error('保存过程中发生错误')
    }
  }
  next()
})

// ==================== 生命周期 ====================
onMounted(async () => {
  // 启动自动保存
  startAutoSave()

  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown)

  // 根据 moteId 加载特定 mote 数据
  if (moteId) {
    try {
      const success = await moteStore.loadMoteData(moteId)
      if (!success) {
        message.error('加载脑图数据失败')
      }
    } catch (error: any) {
      if (error.name === 'NOT_FOUND') {
        message.error(error.message || '脑图笔记不存在')
        // 重定向到404页面
        router.push('/404')
      } else {
        message.error('加载脑图数据失败')
      }
    }
  }
})

onBeforeUnmount(() => {
  // 停止自动保存
  stopAutoSave()

  // 移除键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="less">
.app-mote {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .view-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
}

/* 视图切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
