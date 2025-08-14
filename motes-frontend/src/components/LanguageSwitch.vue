<!--
  语言切换组件

  主要功能：
  - 提供中文/英文语言切换功能
  - 点击按钮直接切换语言
  - 支持图标和文字显示
  - 响应式设计适配

  组件结构：
  - 语言切换按钮：显示当前语言和切换图标
  - 点击切换：直接切换语言
-->
<template>
  <a-button
    type="text"
    size="small"
    class="language-switch-btn"
    :title="currentLanguageLabel"
    @click="handleLanguageToggle"
  >
    <template #icon>
      <GlobalOutlined />
    </template>
    <span class="language-text">{{ currentLanguageText }}</span>
  </a-button>
</template>

<script setup lang="ts">
/**
 * 语言切换组件逻辑
 *
 * 使用 Composition API 管理语言切换状态，
 * 包括当前语言显示和切换功能。
 */

import { computed } from 'vue'
import { GlobalOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/userStore'

// ==================== 状态管理 ====================
const userStore = useUserStore()

// ==================== 国际化 ====================
const { t } = useI18n()

// ==================== 计算属性 ====================
/**
 * 当前语言显示文本
 *
 * 根据当前语言设置返回对应的显示文本。
 *
 * @type {ComputedRef<string>}
 */
const currentLanguageText = computed(() => {
  return userStore.currentLanguage === 'zh-CN'
    ? t('LanguageSwitchVue.languages.enUS')
    : t('LanguageSwitchVue.languages.zhCN')
})

/**
 * 当前语言标签
 *
 * 用于按钮的 title 属性，提供悬停提示。
 *
 * @type {ComputedRef<string>}
 */
const currentLanguageLabel = computed(() => {
  return userStore.currentLanguage === 'zh-CN'
    ? t('LanguageSwitchVue.tooltips.enUS')
    : t('LanguageSwitchVue.tooltips.zhCN')
})

// ==================== 事件处理 ====================
/**
 * 处理语言切换
 *
 * 点击按钮时直接切换到另一种语言。
 *
 * @example
 * handleLanguageToggle()
 * // 从中文切换到英文，或从英文切换到中文
 */
const handleLanguageToggle = () => {
  const newLanguage = userStore.currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN'
  userStore.setLanguage(newLanguage)
}
</script>

<style scoped lang="less">
.language-switch-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  .language-text {
    font-size: 14px;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .language-switch-btn {
    .language-text {
      display: none;
    }
  }
}
</style>
