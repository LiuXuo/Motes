<!--
  404 错误页面组件

  主要功能：
  - 显示页面未找到的错误信息
  - 提供用户友好的错误说明
  - 提供返回首页和返回上页的导航选项
  - 保持与应用整体风格一致的设计

  页面结构：
  - 头部：404错误码和标题
  - 错误说明：详细的错误描述和图标
  - 行动区域：导航按钮
  - 底部：版权信息
-->
<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 头部区域：错误码和标题 -->
      <div class="not-found-header">
        <h1>404</h1>
        <p class="subtitle">页面未找到</p>
      </div>

      <!-- 错误描述区域：详细说明和图标 -->
      <div class="error-section">
        <div class="error-card">
          <!-- 错误图标：使用SVG图标表示错误状态 -->
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3>页面不存在</h3>
          <p>您访问的页面可能已被删除、移动或从未存在过</p>
        </div>
      </div>

      <!-- 行动区域：导航按钮 -->
      <div class="action-section">
        <div class="action-buttons">
          <!-- 返回首页按钮 -->
          <a-button type="primary" size="large" class="action-button home-btn" @click="goToHome">
            返回首页
          </a-button>
          <!-- 返回上页按钮 -->
          <a-button size="large" class="action-button back-btn" @click="goBack">
            返回上页
          </a-button>
        </div>
      </div>

      <!-- 底部信息：版权声明 -->
      <div class="not-found-footer">
        <p>© 2024 Motes. 让思维更有条理，让知识更有价值。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 404 错误页面组件逻辑
 *
 * 使用 Composition API 管理页面导航，
 * 提供返回首页和返回上一页的功能。
 */

import { useRouter } from 'vue-router'

// ==================== 路由管理 ====================
const router = useRouter()

// ==================== 导航方法 ====================
/**
 * 返回首页
 *
 * 导航到应用首页，为用户提供重新开始浏览的选项。
 */
const goToHome = () => {
  router.push('/home')
}

/**
 * 返回上一页
 *
 * 使用浏览器历史记录返回上一页，
 * 为用户提供快速返回的选项。
 */
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped lang="less">
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.not-found-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 64px 48px;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.not-found-header {
  margin-bottom: 48px;

  h1 {
    color: #000;
    font-size: 72px;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: -2px;
  }

  .subtitle {
    color: #666;
    font-size: 18px;
    margin: 0;
    font-weight: 400;
  }
}

.error-section {
  margin-bottom: 48px;
}

.error-card {
  padding: 32px 24px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }

  .error-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    color: #ff4d4f;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    color: #000;
    font-size: 20px;
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

    &.home-btn {
      background-color: rgba(0, 0, 0, 0.66) !important;
      border: none !important;

      &:hover {
        background-color: rgba(0, 0, 0, 0.88) !important;
      }
    }

    &.back-btn {
      border: 2px solid rgba(0, 0, 0, 0.66) !important;
      color: rgba(0, 0, 0, 0.66) !important;
      background: transparent !important;

      &:hover {
        border-color: rgba(0, 0, 0, 0.88) !important;
        color: rgba(0, 0, 0, 0.88) !important;
      }
    }
  }
}

.not-found-footer {
  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 24px;
  }

  .not-found-header h1 {
    font-size: 56px;
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
