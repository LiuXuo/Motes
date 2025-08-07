import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, logoutUser, refreshAccessToken } from '../services/userApi'

// ==================== 接口定义 ====================
export interface User {
  _id: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: User
    token: string
    refreshToken: string
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface RegisterResponse {
  success: boolean
  data?: {
    user: User
    token: string
    refreshToken: string
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}

export const useUserStore = defineStore('user', () => {
  // ==================== 数据状态 ====================
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)

  // ==================== 事件回调 ====================
  const onLoginSuccess = ref<(() => Promise<void>) | null>(null)
  const onLogout = ref<(() => void) | null>(null)

  // ==================== 设置回调方法 ====================
  const setLoginSuccessCallback = (callback: () => Promise<void>) => {
    onLoginSuccess.value = callback
  }

  const setLogoutCallback = (callback: () => void) => {
    onLogout.value = callback
  }

  // ==================== 初始化检查 ====================
  const initializeAuth = async () => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      try {
        currentUser.value = JSON.parse(userData)
        isLoggedIn.value = true
        // 初始化时也获取文档树
        if (onLoginSuccess.value) {
          await onLoginSuccess.value()
        }
      } catch (error) {
        console.error('解析用户数据失败:', error)
        clearAuth()
      }
    } else {
      // 确保未登录状态下清除所有数据
      clearAuth()
    }
  }

  // ==================== 方法定义 ====================
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
          await onLoginSuccess.value()
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
          await onLoginSuccess.value()
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

  const logout = async () => {
    try {
      // 调用后端登出接口
      await logoutUser()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      clearAuth()
    }
  }

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
  const getAuthToken = () => {
    return localStorage.getItem('accessToken')
  }

  const isAuthenticated = () => {
    return !!getAuthToken() && isLoggedIn.value
  }

  return {
    currentUser,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    clearAuth,
    refreshToken,
    getAuthToken,
    isAuthenticated,
    initializeAuth,
    setLoginSuccessCallback,
    setLogoutCallback,
  }
})
