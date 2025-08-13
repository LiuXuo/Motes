<!--
  脑图笔记主组件

  主要功能：
  - 脑图视图和大纲笔记视图的切换
  - 自动保存功能（每分钟自动保存）
  - 键盘快捷键处理（Ctrl+S保存）
  - AI生枝弹窗集成
  - 路由监听和文档切换
  - 离开页面时的保存确认
-->
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

    <!-- AI生枝弹窗 -->
    <AiExpandModal v-model:open="aiStore.aiExpandModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useMoteStore } from '@/stores/moteStore'
import { useAiStore } from '@/stores/aiStore'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import MapRender from '@/components/map/MapRender.vue'
import NoteRender from '@/components/note/NoteRender.vue'
import AiExpandModal from './AiExpandModal.vue'

// ==================== 路由参数 ====================
const route = useRoute()
const router = useRouter()
const moteId = route.params.moteId as string

// ==================== 状态管理 ====================
const moteStore = useMoteStore()
const aiStore = useAiStore()

/**
 * 自动保存定时器
 *
 * 控制自动保存功能的定时器，
 * 每分钟自动保存一次文档。
 *
 * @type {number | null}
 */
let autoSaveTimer: number | null = null

/**
 * 键盘事件处理函数
 *
 * 监听全局键盘事件，处理快捷键操作：
 * - Ctrl+S: 保存文档
 * - 其他快捷键待扩展
 *
 * @param {KeyboardEvent} event - 键盘事件对象
 *
 * @example
 * // 用户按下 Ctrl+S 时会自动保存文档
 */
const handleKeyDown = (event: KeyboardEvent) => {
  // 监听 Ctrl+S 快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // 阻止浏览器默认的保存行为
    saveDocumentWithMessage()
  }
}

/**
 * 通用保存函数
 *
 * 封装文档保存逻辑，包含用户提示和错误处理。
 * 如果文档没有修改则直接返回成功。
 *
 * @returns {Promise<boolean>} 保存是否成功
 *
 * @example
 * const success = await saveDocumentWithMessage()
 * if (success) {
 *   console.log('文档保存成功')
 * }
 *
 * @throws {Error} 当保存过程中发生网络错误时
 */
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
  } catch {
    message.error('保存过程中发生错误')
    return false
  }
}

/**
 * 自动保存函数
 *
 * 执行自动保存操作，调用通用保存函数。
 *
 * @returns {Promise<void>}
 */
const autoSave = async () => {
  await saveDocumentWithMessage()
}

/**
 * 启动自动保存定时器
 *
 * 设置每分钟自动保存一次文档的定时器，
 * 如果已存在定时器会先清除再重新设置。
 *
 * @returns {void}
 *
 * @example
 * startAutoSave()
 * // 每分钟自动保存一次文档
 */
const startAutoSave = () => {
  // 清除可能存在的旧定时器
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }

  // 设置每分钟自动保存（60000毫秒 = 1分钟）
  autoSaveTimer = setInterval(autoSave, 60000)
}

/**
 * 停止自动保存定时器
 *
 * 清除自动保存定时器，停止自动保存功能。
 *
 * @returns {void}
 *
 * @example
 * stopAutoSave()
 * // 停止自动保存功能
 */
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
          } catch (error: unknown) {
            if (error && typeof error === 'object' && 'name' in error && error.name === 'NOT_FOUND') {
              message.error((error as { message?: string }).message || '脑图笔记不存在')
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
    } catch {
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
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NOT_FOUND') {
        message.error((error as { message?: string }).message || '脑图笔记不存在')
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
