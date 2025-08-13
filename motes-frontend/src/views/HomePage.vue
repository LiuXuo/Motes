<!--
  应用首页组件

  主要功能：
  - 展示 Motes 应用的核心功能和设计理念
  - 提供用户登录/注册入口
  - 自动切换功能展示动画
  - 响应式设计适配不同设备

  页面结构：
  - 头部：应用标题和动态副标题
  - 理念：应用设计理念说明
  - 功能：核心功能介绍卡片
  - 行动：登录/注册/进入应用按钮
  - 底部：版权信息
-->
<template>
  <div class="home-container">
    <div class="home-content">
      <!-- 头部区域：应用标题和动态副标题 -->
      <div class="home-header">
        <h1>Motes</h1>
        <!-- 动态切换的副标题，展示不同功能特性 -->
        <a-segmented
          v-model:value="currentSubtitle"
          :options="subtitleOptions"
          class="subtitle-segmented"
          size="large"
        />
        <p class="slogan">Mind Map + Outline Notes</p>
      </div>

      <!-- 设计理念区域：应用核心价值说明 -->
      <div class="concept-section">
        <p class="concept-text">
          Motes 致力于将碎片化的知识微粒连接起来，通过思维导图的视觉化展示和大纲笔记的结构化组织，帮助用户构建完整的知识体系。
        </p>
      </div>

      <!-- 功能介绍区域：核心功能展示卡片 -->
      <div class="features-section">
        <!-- AI生成功能卡片 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3>AI 生成</h3>
          <p>基于主题、文本或文件生成脑图笔记，支持多模型和节点扩展</p>
        </div>

        <!-- 思维导图功能卡片 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c-1 0-2.4-.4-3.5-1.5S16 8 16 7s.4-2.4 1.5-3.5S20 2 21 2s2.4.4 3.5 1.5S26 6 26 7s-.4 2.4-1.5 3.5S22 12 21 12z" />
            </svg>
          </div>
          <h3>思维导图</h3>
          <p>基于 AntV X6 图形引擎，提供流畅的思维导图编辑体验</p>
        </div>

        <!-- 大纲笔记功能卡片 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </div>
          <h3>大纲笔记</h3>
          <p>结构化的笔记大纲，支持文本编辑和滚动同步</p>
        </div>
      </div>

      <!-- 行动区域：用户操作按钮 -->
      <div class="action-section">
        <div class="action-buttons">
          <!-- 未登录状态：显示登录和注册按钮 -->
          <template v-if="!userStore.isLoggedIn">
            <a-button type="primary" size="large" class="action-button login-btn" @click="goToLogin">
              立即登录
            </a-button>
            <a-button size="large" class="action-button register-btn" @click="goToRegister">
              免费注册
            </a-button>
          </template>
          <!-- 已登录状态：显示进入应用按钮 -->
          <template v-else>
            <a-button type="primary" size="large" class="action-button enter-btn" @click="enterMotes">
              进入Motes
            </a-button>
          </template>
        </div>
        <!-- 演示模式提示 -->
        <p class="demo-hint" v-if="!userStore.isLoggedIn">演示模式：无需真实注册即可体验</p>
      </div>

      <!-- 底部信息：版权声明 -->
      <div class="home-footer">
        <p>© 2025 Motes. Connect your motes.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 应用首页组件逻辑
 *
 * 使用 Composition API 管理首页状态和交互，
 * 包括动态副标题切换、用户状态判断和路由导航。
 */

import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { ref, onMounted, onUnmounted } from 'vue'

// ==================== 路由和状态管理 ====================
const router = useRouter()
const userStore = useUserStore()

// ==================== 副标题配置 ====================
/**
 * 副标题选项配置
 *
 * 定义可切换的副标题选项，用于展示应用的不同功能特性。
 *
 * @type {Array<{label: string, value: string}>}
 */
const subtitleOptions = [
  { label: '思维导图', value: 'mindmap' },
  { label: '大纲笔记', value: 'outline' },
]

/**
 * 当前选中的副标题
 *
 * 控制分段控件当前选中的选项，支持自动切换。
 *
 * @type {Ref<string>}
 */
const currentSubtitle = ref('mindmap')

// ==================== 自动切换逻辑 ====================
/** 自动切换定时器引用 */
let subtitleTimer: number | null = null

/**
 * 开始自动切换副标题
 *
 * 每5秒自动切换到下一个副标题选项，
 * 形成循环播放效果，提升页面动态感。
 */
const startAutoSwitch = () => {
  subtitleTimer = setInterval(() => {
    const currentIndex = subtitleOptions.findIndex(option => option.value === currentSubtitle.value)
    const nextIndex = (currentIndex + 1) % subtitleOptions.length
    currentSubtitle.value = subtitleOptions[nextIndex].value
  }, 5000)
}

/**
 * 停止自动切换副标题
 *
 * 清理定时器，防止内存泄漏。
 */
const stopAutoSwitch = () => {
  if (subtitleTimer) {
    clearInterval(subtitleTimer)
    subtitleTimer = null
  }
}

// ==================== 生命周期管理 ====================
/**
 * 组件挂载时启动自动切换
 */
onMounted(() => {
  startAutoSwitch()
})

/**
 * 组件卸载时清理定时器
 */
onUnmounted(() => {
  stopAutoSwitch()
})

// ==================== 路由导航方法 ====================
/**
 * 跳转到登录页面
 *
 * 导航到登录页面，支持用户身份验证。
 */
const goToLogin = () => {
  router.push('/login')
}

/**
 * 跳转到注册页面
 *
 * 导航到登录页面并切换到注册模式，
 * 通过 URL 参数控制表单显示状态。
 */
const goToRegister = () => {
  router.push('/login?mode=register')
}

/**
 * 进入 Motes 应用
 *
 * 已登录用户点击后直接进入文档管理页面。
 */
const enterMotes = () => {
  router.push('/documents')
}
</script>

<style scoped lang="less">
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.home-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 64px 48px;
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.home-header {
  margin-bottom: 48px;

  h1 {
    color: #000;
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: -1px;
  }

  .subtitle-segmented {
    margin-bottom: 8px;
    width: 300px;

    :deep(.ant-segmented) {
      width: 100%;
    }

    :deep(.ant-segmented-item) {
      flex: 1;
    }
  }

  .slogan {
    color: #999;
    font-size: 14px;
    margin: 0;
    font-style: italic;
  }
}

.concept-section {
  margin-bottom: 48px;

  .concept-text {
    color: #666;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.feature-card {
  padding: 32px 20px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    color: #000;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  p {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
}

.action-section {
  margin-bottom: 48px;

  .action-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .action-button {
    min-width: 140px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;

    &.login-btn {
      background-color: rgba(0, 0, 0, 0.66) !important;
      border: none !important;

      &:hover {
        background-color: rgba(0, 0, 0, 0.88) !important;
      }
    }

    &.register-btn {
      border: 2px solid rgba(0, 0, 0, 0.66) !important;
      color: rgba(0, 0, 0, 0.66) !important;
      background: transparent !important;

      &:hover {
        border-color: rgba(0, 0, 0, 0.88) !important;
        color: rgba(0, 0, 0, 0.88) !important;
      }
    }

    &.enter-btn {
      background-color: rgba(0, 0, 0, 0.66) !important;
      border: none !important;

      &:hover {
        background-color: rgba(0, 0, 0, 0.88) !important;
      }
    }
  }

  .demo-hint {
    color: #999;
    font-size: 12px;
    margin: 0;
  }
}

.home-footer {
  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .home-content {
    padding: 40px 24px;
  }

  .home-header h1 {
    font-size: 36px;
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>
