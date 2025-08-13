/**
 * 用户认证 API 服务
 *
 * 封装与后端用户认证相关的 API 调用，包括：
 * - 用户登录和注册
 * - 用户信息管理
 * - Token 刷新
 * - 密码修改
 * - 用户登出
 *
 * 所有接口都通过统一的 api 实例调用，自动处理认证和错误。
 *
 * @class UserApiService
 */
import api from './api'

// ==================== 用户认证API ====================

/**
 * 用户登录
 *
 * 验证用户凭据并获取访问令牌，支持用户名密码登录。
 * 登录成功后会返回 accessToken 和 refreshToken。
 *
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<ApiResponse>} 登录响应，包含 token 信息
 *
 * @example
 * const response = await loginUser('admin', 'password123')
 * if (response.success) {
 *   localStorage.setItem('accessToken', response.data.token)
 *   localStorage.setItem('refreshToken', response.data.refreshToken)
 * }
 *
 * @throws {401} 当用户名或密码错误时
 * @throws {500} 当服务器错误时
 */
export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/user/login', { username, password })
  return response.data
}

/**
 * 用户注册
 *
 * 创建新用户账户，支持用户名、邮箱和密码注册。
 * 注册成功后用户可以直接登录。
 *
 * @param {string} username - 用户名
 * @param {string} email - 邮箱地址
 * @param {string} password - 密码
 * @returns {Promise<ApiResponse>} 注册响应
 *
 * @example
 * const response = await registerUser('newuser', 'user@example.com', 'password123')
 * if (response.success) {
 *   message.success('注册成功，请登录')
 * }
 *
 * @throws {400} 当用户名或邮箱已存在时
 * @throws {422} 当输入数据格式错误时
 * @throws {500} 当服务器错误时
 */
export const registerUser = async (username: string, email: string, password: string) => {
  const response = await api.post('/user/register', { username, email, password })
  return response.data
}

/**
 * 用户登出
 *
 * 清除当前用户的登录状态，使当前 token 失效。
 * 登出后需要重新登录才能访问受保护的资源。
 *
 * @returns {Promise<ApiResponse>} 登出响应
 *
 * @example
 * await logoutUser()
 * localStorage.removeItem('accessToken')
 * localStorage.removeItem('refreshToken')
 * router.push('/login')
 *
 * @throws {401} 当用户未登录时
 * @throws {500} 当服务器错误时
 */
export const logoutUser = async () => {
  const response = await api.post('/user/logout')
  return response.data
}

/**
 * 刷新访问令牌
 *
 * 使用 refreshToken 获取新的 accessToken，用于 token 过期时的自动刷新。
 * 通常在响应拦截器中自动调用，无需手动调用。
 *
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise<ApiResponse>} 刷新响应，包含新的 token 信息
 *
 * @example
 * const response = await refreshAccessToken(refreshToken)
 * if (response.success) {
 *   localStorage.setItem('accessToken', response.data.token)
 *   localStorage.setItem('refreshToken', response.data.refreshToken)
 * }
 *
 * @throws {401} 当 refreshToken 无效或过期时
 * @throws {500} 当服务器错误时
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post('/user/refresh', { refreshToken })
  return response.data
}

/**
 * 获取当前用户信息
 *
 * 获取当前登录用户的详细信息，包括用户名、邮箱等。
 * 需要有效的 accessToken 才能调用。
 *
 * @returns {Promise<ApiResponse>} 用户信息响应
 *
 * @example
 * const response = await getCurrentUser()
 * if (response.success) {
 *   userStore.setUserInfo(response.data)
 * }
 *
 * @throws {401} 当用户未登录或 token 无效时
 * @throws {500} 当服务器错误时
 */
export const getCurrentUser = async () => {
  const response = await api.get('/user/profile')
  return response.data
}

/**
 * 更新用户信息
 *
 * 修改当前用户的基本信息，支持修改用户名和邮箱。
 * 修改后需要重新登录才能生效。
 *
 * @param {Object} userData - 用户数据
 * @param {string} [userData.username] - 新用户名
 * @param {string} [userData.email] - 新邮箱地址
 * @returns {Promise<ApiResponse>} 更新响应
 *
 * @example
 * const response = await updateUserProfile({ username: 'newusername' })
 * if (response.success) {
 *   message.success('用户信息更新成功')
 * }
 *
 * @throws {400} 当用户名或邮箱已存在时
 * @throws {401} 当用户未登录时
 * @throws {422} 当输入数据格式错误时
 * @throws {500} 当服务器错误时
 */
export const updateUserProfile = async (userData: { username?: string; email?: string }) => {
  const response = await api.put('/user/profile', userData)
  return response.data
}

/**
 * 修改密码
 *
 * 修改当前用户的登录密码，需要提供旧密码进行验证。
 * 修改成功后需要重新登录。
 *
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<ApiResponse>} 修改响应
 *
 * @example
 * const response = await changePassword('oldpass', 'newpass123')
 * if (response.success) {
 *   message.success('密码修改成功，请重新登录')
 *   logoutUser()
 * }
 *
 * @throws {400} 当旧密码错误时
 * @throws {401} 当用户未登录时
 * @throws {422} 当新密码格式不符合要求时
 * @throws {500} 当服务器错误时
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await api.put('/user/password', { oldPassword, newPassword })
  return response.data
}
