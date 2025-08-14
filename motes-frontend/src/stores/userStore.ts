/**
 * 用户认证状态管理 Store
 *
 * 负责管理用户的认证状态和相关信息，包括：
 * - 用户登录、注册、登出功能
 * - 用户信息的本地存储和状态管理
 * - Token 的刷新和管理
 * - 登录状态的回调机制
 * - 与其他 Store 的认证状态同步
 *
 * @class useUserStore
 * @example
 * const userStore = useUserStore()
 * const result = await userStore.login('username', 'password')
 * if (result.success) {
 *   console.log('登录成功')
 * }
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, logoutUser, refreshAccessToken } from '../services/userApi'
import { message } from 'ant-design-vue'

// ==================== 接口定义 ====================

/**
 * 用户信息接口
 *
 * 定义用户的基本信息结构，包括用户ID、用户名、邮箱等。
 *
 * @interface User
 */
export interface User {
  /** 用户唯一标识符 */
  _id: string
  /** 用户名 */
  username: string
  /** 用户邮箱 */
  email: string
  /** 用户创建时间 */
  createdAt: Date
  /** 用户信息更新时间 */
  updatedAt: Date
}

/**
 * 登录响应接口
 *
 * 定义登录 API 的响应数据结构，包含成功和失败两种情况。
 *
 * @interface LoginResponse
 */
export interface LoginResponse {
  /** 操作是否成功 */
  success: boolean
  /** 成功时的数据 */
  data?: {
    /** 用户信息 */
    user: User
    /** 访问令牌 */
    token: string
    /** 刷新令牌 */
    refreshToken: string
  }
  /** 失败时的错误信息 */
  error?: {
    /** 错误代码 */
    code: string
    /** 错误消息 */
    message: string
    /** 错误详情 */
    details?: string
  }
}

/**
 * 注册响应接口
 *
 * 定义注册 API 的响应数据结构，与登录响应结构类似。
 *
 * @interface RegisterResponse
 */
export interface RegisterResponse {
  /** 操作是否成功 */
  success: boolean
  /** 成功时的数据 */
  data?: {
    /** 用户信息 */
    user: User
    /** 访问令牌 */
    token: string
    /** 刷新令牌 */
    refreshToken: string
  }
  /** 失败时的错误信息 */
  error?: {
    /** 错误代码 */
    code: string
    /** 错误消息 */
    message: string
    /** 错误详情 */
    details?: string
  }
}

export const useUserStore = defineStore('user', () => {
  // ==================== 数据状态 ====================

  /** 当前登录用户信息 */
  const currentUser = ref<User | null>(null)

  /** 用户是否已登录 */
  const isLoggedIn = ref(false)

  /** 是否正在加载（登录/注册过程中） */
  const isLoading = ref(false)

  /** 当前用户语言设置 */
  const currentLanguage = ref<'zh-CN' | 'en-US'>('zh-CN')

  // ==================== 事件回调 ====================

  /** 登录成功后的回调函数 */
  const onLoginSuccess = ref<((language?: 'zh-CN' | 'en-US') => Promise<void>) | null>(null)

  /** 登出时的回调函数 */
  const onLogout = ref<(() => void) | null>(null)

  // ==================== 设置回调方法 ====================

  /**
   * 设置登录成功回调
   *
   * 当用户登录成功后，会执行此回调函数。
   * 通常用于初始化其他 Store 的数据。
   *
   * @param {(language?: 'zh-CN' | 'en-US') => Promise<void>} callback - 登录成功后的回调函数
   *
   * @example
   * userStore.setLoginSuccessCallback(async (language) => {
   *   await docStore.fetchDocTree(language)
   * })
   */
  const setLoginSuccessCallback = (callback: (language?: 'zh-CN' | 'en-US') => Promise<void>) => {
    onLoginSuccess.value = callback
  }

  /**
   * 设置登出回调
   *
   * 当用户登出时，会执行此回调函数。
   * 通常用于清理其他 Store 的数据。
   *
   * @param {() => void} callback - 登出时的回调函数
   *
   * @example
   * userStore.setLogoutCallback(() => {
   *   docStore.resetDocTree()
   *   moteStore.resetMoteTree()
   * })
   */
  const setLogoutCallback = (callback: () => void) => {
    onLogout.value = callback
  }

  // ==================== 初始化检查 ====================

  /**
   * 初始化用户认证状态
   *
   * 在应用启动时检查本地存储中的认证信息，
   * 如果存在有效的 token 和用户数据，则恢复登录状态。
   * 同时初始化语言设置。
   *
   * @returns {Promise<void>} 初始化完成
   *
   * @example
   * await userStore.initializeAuth()
   *
   * @throws {Error} 当解析用户数据失败时
   */
  const initializeAuth = async () => {
    // 初始化语言设置
    initializeLanguage()

    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      try {
        currentUser.value = JSON.parse(userData)
        isLoggedIn.value = true
        // 初始化时也获取文档树
        if (onLoginSuccess.value) {
          await onLoginSuccess.value(currentLanguage.value)
        }
      } catch {
        message.error('解析用户数据失败:')
        clearAuth()
      }
    } else {
      // 确保未登录状态下清除所有数据
      clearAuth()
    }
  }

  // ==================== 方法定义 ====================

  /**
   * 用户登录
   *
   * 验证用户凭据并完成登录流程，包括：
   * - 调用后端登录 API
   * - 保存用户信息和 token 到本地存储
   * - 更新登录状态
   * - 执行登录成功回调
   *
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<LoginResponse>} 登录结果
   *
   * @example
   * const result = await userStore.login('myuser', 'mypassword')
   * if (result.success) {
   *   message.success('登录成功')
   * } else {
   *   message.error(result.error?.message)
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当用户凭据无效时
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    isLoading.value = true

    try {
      const data = await loginUser(username, password)

      if (data.success && data.data) {
        // 保存用户信息和token
        currentUser.value = data.data.user
        isLoggedIn.value = true
        localStorage.setItem('accessToken', data.data.token)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        localStorage.setItem('userData', JSON.stringify(data.data.user))

        // 登录成功后获取文档树
        if (onLoginSuccess.value) {
          await onLoginSuccess.value(currentLanguage.value)
        }

        return { success: true, data: data.data }
      } else {
        return { success: false, error: { code: 'UNKNOWN_ERROR', message: '登录失败' } }
      }
    } catch (error: any) {
      const errorResponse = error.response?.data
      if (errorResponse?.error) {
        return { success: false, error: errorResponse.error }
      }
      return { success: false, error: { code: 'NETWORK_ERROR', message: '网络错误，请检查连接' } }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   *
   * 创建新用户账户并自动登录，包括：
   * - 调用后端注册 API
   * - 保存用户信息和 token 到本地存储
   * - 更新登录状态
   * - 执行登录成功回调
   *
   * @param {string} username - 用户名
   * @param {string} email - 邮箱地址
   * @param {string} password - 密码
   * @returns {Promise<RegisterResponse>} 注册结果
   *
   * @example
   * const result = await userStore.register('newuser', 'user@example.com', 'password123')
   * if (result.success) {
   *   message.success('注册并登录成功')
   * } else {
   *   message.error(result.error?.message)
   * }
   *
   * @throws {Error} 当网络请求失败时
   * @throws {Error} 当用户名或邮箱已存在时
   */
  const register = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
    isLoading.value = true

    try {
      const data = await registerUser(username, email, password)

      if (data.success && data.data) {
        // 保存用户信息和token
        currentUser.value = data.data.user
        isLoggedIn.value = true
        localStorage.setItem('accessToken', data.data.token)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        localStorage.setItem('userData', JSON.stringify(data.data.user))

        // 注册成功后获取文档树
        if (onLoginSuccess.value) {
          await onLoginSuccess.value(currentLanguage.value)
        }

        return { success: true, data: data.data }
      } else {
        return { success: false, error: { code: 'UNKNOWN_ERROR', message: '注册失败' } }
      }
    } catch (error: any) {
      const errorResponse = error.response?.data
      if (errorResponse?.error) {
        return { success: false, error: errorResponse.error }
      }
      return { success: false, error: { code: 'NETWORK_ERROR', message: '网络错误，请检查连接' } }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   *
   * 清除用户认证状态并调用后端登出接口，
   * 包括清理本地存储和执行登出回调。
   *
   * @returns {Promise<void>} 登出完成
   *
   * @example
   * await userStore.logout()
   * router.push('/login')
   *
   * @throws {Error} 当登出请求失败时（不影响本地清理）
   */
  const logout = async () => {
    try {
      // 调用后端登出接口
      await logoutUser()
    } catch {
      message.error('登出请求失败:')
    } finally {
      clearAuth()
    }
  }

  /**
   * 清除认证状态
   *
   * 清除所有本地存储的认证信息和状态，
   * 并执行登出回调函数。
   *
   * @example
   * userStore.clearAuth()
   */
  const clearAuth = () => {
    currentUser.value = null
    isLoggedIn.value = false
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userData')

    // 清空其他store的数据
    if (onLogout.value) {
      onLogout.value()
    }
  }

  /**
   * 刷新访问令牌
   *
   * 使用刷新令牌获取新的访问令牌，
   * 当访问令牌过期时自动调用。
   *
   * @returns {Promise<string>} 新的访问令牌
   *
   * @example
   * try {
   *   const newToken = await userStore.refreshToken()
   *   console.log('令牌刷新成功')
   * } catch (error) {
   *   // 刷新失败，需要重新登录
   *   userStore.clearAuth()
   * }
   *
   * @throws {Error} 当没有刷新令牌时
   * @throws {Error} 当刷新令牌无效时
   */
  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken')
    if (!refreshTokenValue) {
      throw new Error('没有刷新令牌')
    }

    try {
      const data = await refreshAccessToken(refreshTokenValue)

      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.token)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        return data.data.token
      }
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 获取当前访问令牌
   *
   * @returns {string | null} 访问令牌，未登录时返回 null
   *
   * @example
   * const token = userStore.getAuthToken()
   * if (token) {
   *   // 使用令牌进行 API 调用
   * }
   */
  const getAuthToken = () => {
    return localStorage.getItem('accessToken')
  }

  /**
   * 检查用户是否已认证
   *
   * 同时检查本地存储中的令牌和登录状态。
   *
   * @returns {boolean} 用户是否已认证
   *
   * @example
   * if (userStore.isAuthenticated()) {
   *   // 用户已登录，可以访问受保护的页面
   * }
   */
  const isAuthenticated = () => {
    return !!getAuthToken() && isLoggedIn.value
  }

  // ==================== 语言管理 ====================

  /**
   * 初始化语言设置
   *
   * 检查本地存储中的语言设置，如果没有则检测浏览器语言，
   * 默认使用中文，并将设置保存到本地存储。
   *
   * @example
   * userStore.initializeLanguage()
   */
  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem('userLanguage')

    if (savedLanguage && (savedLanguage === 'zh-CN' || savedLanguage === 'en-US')) {
      currentLanguage.value = savedLanguage
    } else {
      // 检测浏览器语言
      const browserLanguage = navigator.language || navigator.languages?.[0] || 'zh-CN'
      const detectedLanguage = browserLanguage.startsWith('zh') ? 'zh-CN' : 'en-US'
      currentLanguage.value = detectedLanguage
      localStorage.setItem('userLanguage', detectedLanguage)
    }
  }

  /**
   * 设置用户语言
   *
   * 更新当前语言设置并保存到本地存储。
   *
   * @param {'zh-CN' | 'en-US'} language - 要设置的语言代码
   *
   * @example
   * userStore.setLanguage('en-US')
   */
  const setLanguage = (language: 'zh-CN' | 'en-US') => {
    currentLanguage.value = language
    localStorage.setItem('userLanguage', language)
  }

  return {
    currentUser,
    isLoggedIn,
    isLoading,
    currentLanguage,
    login,
    register,
    logout,
    clearAuth,
    refreshToken,
    getAuthToken,
    isAuthenticated,
    initializeAuth,
    setLanguage,
    setLoginSuccessCallback,
    setLogoutCallback,
  }
})
