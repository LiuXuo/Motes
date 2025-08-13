/**
 * API 基础配置和拦截器
 *
 * 封装 axios 实例，提供统一的 API 请求配置：
 * - 基础 URL 配置
 * - 请求/响应拦截器
 * - 认证 token 自动添加
 * - 错误处理和 token 刷新
 * - 超时设置
 *
 * 主要功能：
 * - 自动为请求添加 Authorization 头
 * - 处理 401 错误，自动刷新 token
 * - 统一的错误处理机制
 * - 支持 token 过期自动跳转登录
 *
 * @constant {AxiosInstance} api - 配置好的 axios 实例
 */
import axios from 'axios'

/**
 * API 基础 URL 配置
 *
 * 从环境变量获取 API 地址，默认为本地开发地址。
 * 支持不同环境的 API 地址配置。
 *
 * @constant {string} API_BASE_URL - API 基础地址
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * 创建 axios 实例
 *
 * 配置基础请求参数，包括：
 * - 基础 URL
 * - 超时时间（10秒）
 * - 默认请求头
 *
 * @constant {AxiosInstance} api - 配置好的 axios 实例
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

/**
 * 请求拦截器
 *
 * 在每个请求发送前自动添加认证 token：
 * - 从 localStorage 获取 accessToken
 * - 自动添加到 Authorization 头
 * - 处理请求错误
 *
 * @param {AxiosRequestConfig} config - 请求配置
 * @returns {AxiosRequestConfig} 修改后的请求配置
 *
 * @example
 * // 拦截器会自动为所有请求添加 token
 * api.get('/user/profile') // 自动添加 Authorization: Bearer <token>
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 *
 * 处理响应数据和错误，主要功能：
 * - 处理 401 认证错误
 * - 自动刷新过期的 token
 * - 重试因 token 过期失败的请求
 * - 处理刷新失败的情况
 * - 统一错误处理
 *
 * @param {AxiosResponse} response - 成功响应
 * @param {AxiosError} error - 错误响应
 * @returns {AxiosResponse | Promise<AxiosResponse>} 响应数据或重试的请求
 *
 * @example
 * // 拦截器会自动处理以下场景：
 * // 1. 请求成功 -> 直接返回响应数据
 * // 2. 401 错误 -> 尝试刷新 token 并重试请求
 * // 3. 刷新失败 -> 清除 token 并跳转登录页
 */
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/user/refresh`, {
            refreshToken
          })
          const { token, refreshToken: newRefreshToken } = response.data.data
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          // 重试原请求
          error.config.headers.Authorization = `Bearer ${token}`
          return api.request(error.config)
        } catch {
          // 刷新失败，清除token并跳转到登录页
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      } else {
        // 没有refreshToken，跳转到登录页
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
