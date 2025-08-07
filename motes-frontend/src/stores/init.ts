import { useUserStore } from './userStore'
import { useDocStore } from './docStore'
import { useMoteStore } from './moteStore'

/**
 * 初始化所有store之间的依赖关系
 */
export const initializeStores = async () => {
  const userStore = useUserStore()
  const docStore = useDocStore()
  const moteStore = useMoteStore()

  // 设置登录成功回调
  userStore.setLoginSuccessCallback(async () => {
    try {
      await docStore.fetchDocTree()
    } catch (error) {
      console.error('初始化时获取文档树失败:', error)
    }
  })

  // 设置登出回调
  userStore.setLogoutCallback(() => {
    docStore.resetDocTree()
    moteStore.resetMoteTree()
  })

  // 初始化用户认证状态（这会触发登录成功回调）
  await userStore.initializeAuth()
}
