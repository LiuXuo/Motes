/**
 * Store 初始化模块
 *
 * 负责初始化所有 Store 之间的依赖关系和事件回调，
 * 确保应用启动时各个 Store 能够正确协作。
 *
 * 主要功能：
 * - 设置用户登录成功后的回调函数
 * - 设置用户登出时的清理回调
 * - 初始化用户认证状态
 * - 协调不同 Store 之间的数据同步
 *
 * @module stores/init
 */

import { useUserStore } from './userStore'
import { useDocStore } from './docStore'
import { useMoteStore } from './moteStore'

/**
 * 初始化所有 Store 之间的依赖关系
 *
 * 设置用户认证状态变化时的回调函数，确保：
 * - 登录成功后自动获取文档树
 * - 登出时清理所有相关数据
 * - Store 之间的数据同步
 *
 * @returns {Promise<void>} 初始化完成
 *
 * @example
 * // 在应用启动时调用
 * await initializeStores()
 *
 * @throws {Error} 当初始化过程中发生错误时
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
