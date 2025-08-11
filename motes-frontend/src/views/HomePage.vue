<template>
  <div class="home-container">
    <div class="home-content">
      <!-- 头部区域 -->
      <div class="home-header">
        <h1>Motes</h1>
        <a-segmented
          v-model:value="currentSubtitle"
          :options="subtitleOptions"
          class="subtitle-segmented"
          size="large"
        />
        <p class="slogan">Mind Map + Outline Notes</p>
      </div>

      <!-- 设计理念区域 -->
      <div class="concept-section">
        <p class="concept-text">
          Motes 致力于将碎片化的知识微粒连接起来，通过思维导图的视觉化展示和大纲笔记的结构化组织，帮助用户构建完整的知识体系。
        </p>
      </div>

      <!-- 功能介绍区域 -->
      <div class="features-section">
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

        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <h3>云端同步</h3>
          <p>JWT 认证，用户数据安全存储，支持多设备访问</p>
        </div>
      </div>

      <!-- 行动区域 -->
      <div class="action-section">
        <div class="action-buttons">
          <template v-if="!userStore.isLoggedIn">
            <a-button type="primary" size="large" class="action-button login-btn" @click="goToLogin">
              立即登录
            </a-button>
            <a-button size="large" class="action-button register-btn" @click="goToRegister">
              免费注册
            </a-button>
          </template>
          <template v-else>
            <a-button type="primary" size="large" class="action-button enter-btn" @click="enterMotes">
              进入Motes
            </a-button>
          </template>
        </div>
        <p class="demo-hint" v-if="!userStore.isLoggedIn">演示模式：无需真实注册即可体验</p>
      </div>

      <!-- 底部信息 -->
      <div class="home-footer">
        <p>© 2025 Motes. Connect your motes.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const userStore = useUserStore()

// 分段控件选项
const subtitleOptions = [
  { label: '思维导图', value: 'mindmap' },
  { label: '大纲笔记', value: 'outline' },
]

// 当前选中的选项
const currentSubtitle = ref('mindmap')

// 自动切换定时器
let subtitleTimer: number | null = null

// 自动切换subtitle
const startAutoSwitch = () => {
  subtitleTimer = setInterval(() => {
    const currentIndex = subtitleOptions.findIndex(option => option.value === currentSubtitle.value)
    const nextIndex = (currentIndex + 1) % subtitleOptions.length
    currentSubtitle.value = subtitleOptions[nextIndex].value
  }, 5000)
}

// 停止自动切换
const stopAutoSwitch = () => {
  if (subtitleTimer) {
    clearInterval(subtitleTimer)
    subtitleTimer = null
  }
}

// 组件挂载时开始自动切换
onMounted(() => {
  startAutoSwitch()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoSwitch()
})

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 跳转到注册页面（实际是登录页面，但切换到注册模式）
const goToRegister = () => {
  router.push('/login?mode=register')
}

// 进入Motes应用
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
