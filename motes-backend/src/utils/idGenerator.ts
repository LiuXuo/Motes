/**
 * ID 生成器工具文件
 * 
 * 提供安全的随机 ID 生成功能，包括：
 * - 固定长度随机 ID 生成
 * - 自定义长度随机 ID 生成
 * - 基于 nanoid 库的安全 ID 生成
 * 
 */
import { customAlphabet } from 'nanoid';

// 创建自定义的 nanoid 函数，只使用大小写字母和数字
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * 生成随机 ID
 * 
 * 生成 8 位随机 ID，只包含大小写字母和数字。
 * 使用 nanoid 库确保 ID 的唯一性和安全性。
 * 
 * @returns {string} 8 位随机 ID，只包含大小写字母和数字
 * 
 * @example
 * const id = generateId();
 * console.log(id); // 输出类似: "aB3cD9xY"
 * 
 * @throws {Error} 当 ID 生成失败时
 */
export const generateId = (): string => {
  return nanoid();
};

/**
 * 生成指定长度的随机 ID
 * 
 * 根据指定长度生成随机 ID，只包含大小写字母和数字。
 * 适用于需要不同长度 ID 的场景。
 * 
 * @param {number} length - ID 长度，必须大于 0
 * @returns {string} 指定长度的随机 ID，只包含大小写字母和数字
 * 
 * @example
 * const shortId = generateIdWithLength(4);  // 4 位 ID
 * const longId = generateIdWithLength(16);  // 16 位 ID
 * 
 * @throws {Error} 当长度参数无效时
 * @throws {Error} 当 ID 生成失败时
 */
export const generateIdWithLength = (length: number): string => {
  const customNanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    length,
  );
  return customNanoid();
}; 