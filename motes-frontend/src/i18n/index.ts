import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import { useUserStore } from '@/stores/userStore'
// 导入 Ant Design Vue 的语言包
import zhCN_antd from 'ant-design-vue/es/locale/zh_CN'
import enUS_antd from 'ant-design-vue/es/locale/en_US'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

// 监听用户语言变化
export function setupI18n() {
  const userStore = useUserStore()

  // 设置初始语言
  i18n.global.locale.value = userStore.currentLanguage

  // 监听语言变化
  watch(() => userStore.currentLanguage, (newLocale) => {
    i18n.global.locale.value = newLocale
  })
}

// 获取 Ant Design Vue 的语言包
export function getAntdLocale() {
  const userStore = useUserStore()
  return userStore.currentLanguage === 'zh-CN' ? zhCN_antd : enUS_antd
}

// 监听语言变化并更新 Ant Design Vue 的语言包
export function setupAntdI18n() {
  const userStore = useUserStore()

  // 监听语言变化
  watch(() => userStore.currentLanguage, () => {
    // 这里可以触发 Ant Design Vue 的语言更新
    // 由于 Ant Design Vue 4.x 版本的语言包是通过 ConfigProvider 传递的
    // 我们只需要确保组件能够获取到最新的语言包即可
  })
}

export default i18n
