/**
 * API 服务统一导出
 *
 * 集中导出所有 API 服务模块，提供统一的导入入口。
 * 包括基础 API 实例和各种业务 API 服务。
 *
 * 导出的服务模块：
 * - api: 基础 API 实例（axios 配置和拦截器）
 * - userApi: 用户认证相关 API
 * - docApi: 文档管理相关 API
 * - moteApi: 脑图笔记相关 API
 * - aiApi: AI 生成相关 API
 *
 * @module services
 * @example
 * // 导入基础 API 实例
 * import { api } from '@/services'
 *
 * // 导入用户 API
 * import { loginUser, registerUser } from '@/services'
 *
 * // 导入文档 API
 * import { getDocTree, createDocNode } from '@/services'
 *
 * // 导入脑图 API
 * import { getMoteData, updateMoteData } from '@/services'
 *
 * // 导入 AI API
 * import { aiApi } from '@/services'
 */
// ==================== API 统一导出 ====================

// 基础 API 实例
export { default as api } from './api'

// 用户认证 API
export * from './userApi'

// 文档管理 API
export * from './docApi'

// 脑图笔记 API
export * from './moteApi'

// AI 生成 API
export * from './aiApi'
