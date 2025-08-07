import { customAlphabet } from 'nanoid'

// 创建自定义的nanoid函数，只使用大小写字母和数字
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8)

/**
 * 生成随机ID
 * @returns 返回8位随机ID，只包含大小写字母和数字
 */
export const generateId = (): string => {
  return nanoid()
}

/**
 * 生成指定长度的随机ID
 * @param length ID长度
 * @returns 返回指定长度的随机ID，只包含大小写字母和数字
 */
export const generateIdWithLength = (length: number): string => {
  const customNanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    length,
  )
  return customNanoid()
}
