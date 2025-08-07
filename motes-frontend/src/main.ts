import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { initializeStores } from './stores/init'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

// 初始化所有store和用户认证状态
initializeStores().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('初始化失败:', error)
  app.mount('#app')
})
