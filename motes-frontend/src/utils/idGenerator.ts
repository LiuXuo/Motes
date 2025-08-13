/**
 * Motes 前端 ID 生成器工具模块
 *
 * 主要功能：
 * - 生成随机唯一标识符
 * - 支持自定义长度的 ID 生成
 * - 提供脑图节点 ID 生成服务
 *
 * 技术特点：
 * - 基于 nanoid 库实现
 * - 只使用大小写字母和数字
 * - 保证 ID 的唯一性和可读性
 *
 * @file idGenerator.ts
 * @description ID 生成工具函数
 */

import { customAlphabet } from 'nanoid'

/**
 * 默认 ID 生成器
 *
 * 创建自定义的 nanoid 函数，生成8位随机字符串，
 * 只使用大小写字母和数字，避免特殊字符。
 *
 * @constant {Function} nanoid - 8位随机ID生成函数
 * @example
 * const id = nanoid() // 例如: "aB3cD9xY"
 */
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8)

/**
 * 生成随机ID
 *
 * 使用 nanoid 库生成8位随机字符串，
 * 只包含大小写字母和数字，用于节点ID生成。
 *
 * @returns {string} 8位随机ID
 *
 * @example
 * const nodeId = generateId() // 例如: "aB3cD9xY"
 *
 * // 在脑图节点创建中使用
 * const newNode = {
 *   id: generateId(),
 *   text: '新节点',
 *   children: []
 * }
 */
export const generateId = (): string => {
  return nanoid()
}

/**
 * 生成指定长度的随机ID
 *
 * 根据指定长度生成随机字符串，
 * 用于需要特定长度ID的场景，如短链接、临时标识等。
 *
 * @param {number} length - ID长度，必须大于0
 * @returns {string} 指定长度的随机ID
 *
 * @example
 * const shortId = generateIdWithLength(4) // 例如: "aB3c"
 * const longId = generateIdWithLength(16) // 例如: "aB3cD9xYz1mN2pQ4"
 *
 * // 在需要不同长度ID的场景中使用
 * const tempId = generateIdWithLength(6) // 临时标识
 * const sessionId = generateIdWithLength(12) // 会话标识
 *
 * @throws {Error} 当长度参数小于等于0时
 */
export const generateIdWithLength = (length: number): string => {
  // 参数验证
  if (length <= 0) {
    throw new Error('ID长度必须大于0')
  }

  // 创建指定长度的自定义 nanoid 函数
  const customNanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    length,
  )
  return customNanoid()
}
