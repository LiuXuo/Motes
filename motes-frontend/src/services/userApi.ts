import api from './api'

// ==================== 用户认证API ====================

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录响应
 */
export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/user/login', { username, password })
  return response.data
}

/**
 * 用户注册
 * @param username 用户名
 * @param email 邮箱
 * @param password 密码
 * @returns 注册响应
 */
export const registerUser = async (username: string, email: string, password: string) => {
  const response = await api.post('/user/register', { username, email, password })
  return response.data
}

/**
 * 用户登出
 * @returns 登出响应
 */
export const logoutUser = async () => {
  const response = await api.post('/user/logout')
  return response.data
}

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 * @returns 刷新响应
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post('/user/refresh', { refreshToken })
  return response.data
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = async () => {
  const response = await api.get('/user/profile')
  return response.data
}

/**
 * 更新用户信息
 * @param userData 用户数据
 * @returns 更新响应
 */
export const updateUserProfile = async (userData: { username?: string; email?: string }) => {
  const response = await api.put('/user/profile', userData)
  return response.data
}

/**
 * 修改密码
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @returns 修改响应
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await api.put('/user/password', { oldPassword, newPassword })
  return response.data
}
