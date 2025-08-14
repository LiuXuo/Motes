import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles/antd-overrides.less'
import { initializeStores } from './stores/init'
import i18n, { setupI18n, setupAntdI18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(i18n)

// 初始化所有store和用户认证状态
initializeStores().then(() => {
  // 设置i18n语言监听
  setupI18n()
  // 设置 Ant Design Vue 国际化
  setupAntdI18n()
  app.mount('#app')
}).catch((error) => {
  console.error('初始化失败:', error)
  // 即使初始化失败也要设置i18n
  setupI18n()
  setupAntdI18n()
  app.mount('#app')
})
