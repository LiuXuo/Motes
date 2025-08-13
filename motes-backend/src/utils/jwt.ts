/**
 * JWT 工具函数文件
 * 
 * 提供 JWT 令牌的生成、验证和管理功能，包括：
 * - 访问令牌生成和验证
 * - 刷新令牌生成和验证
 * - 令牌载荷类型定义
 * 
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT 配置常量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * JWT 访问令牌载荷接口
 * 
 * 定义访问令牌中存储的用户信息
 */
export interface JWTPayload {
  /** 用户唯一标识符 */
  userId: string;
  /** 用户名 */
  username: string;
}

/**
 * JWT 刷新令牌载荷接口
 * 
 * 定义刷新令牌中存储的信息，用于令牌刷新机制
 */
export interface RefreshTokenPayload {
  /** 用户唯一标识符 */
  userId: string;
  /** 令牌版本号，用于令牌撤销 */
  tokenVersion?: number;
}

/**
 * 生成访问令牌
 * 
 * 使用用户信息生成 JWT 访问令牌，用于 API 认证。
 * 令牌包含用户ID和用户名信息，有效期由环境变量配置。
 * 
 * @param {JWTPayload} payload - 令牌载荷，包含用户信息
 * @returns {string} JWT 访问令牌
 * 
 * @example
 * const token = generateAccessToken({
 *   userId: 'user123',
 *   username: 'testuser'
 * });
 * 
 * @throws {Error} 当 JWT 签名失败时
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * 生成刷新令牌
 * 
 * 生成用于刷新访问令牌的 JWT 刷新令牌。
 * 刷新令牌的有效期通常比访问令牌更长。
 * 
 * @param {RefreshTokenPayload} payload - 刷新令牌载荷
 * @returns {string} JWT 刷新令牌
 * 
 * @example
 * const refreshToken = generateRefreshToken({
 *   userId: 'user123',
 *   tokenVersion: 1
 * });
 * 
 * @throws {Error} 当 JWT 签名失败时
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES_IN as any };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

/**
 * 验证访问令牌
 * 
 * 验证 JWT 访问令牌的有效性，并返回令牌载荷。
 * 如果令牌无效或已过期，将抛出错误。
 * 
 * @param {string} token - JWT 访问令牌
 * @returns {JWTPayload} 令牌载荷，包含用户信息
 * 
 * @example
 * try {
 *   const payload = verifyAccessToken(token);
 *   console.log('用户ID:', payload.userId);
 * } catch (error) {
 *   console.log('令牌无效');
 * }
 * 
 * @throws {Error} 当令牌无效、过期或签名错误时
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new Error('无效的访问令牌');
  }
};

/**
 * 验证刷新令牌
 * 
 * 验证 JWT 刷新令牌的有效性，并返回令牌载荷。
 * 如果令牌无效或已过期，将抛出错误。
 * 
 * @param {string} token - JWT 刷新令牌
 * @returns {RefreshTokenPayload} 刷新令牌载荷
 * 
 * @example
 * try {
 *   const payload = verifyRefreshToken(refreshToken);
 *   console.log('用户ID:', payload.userId);
 * } catch (error) {
 *   console.log('刷新令牌无效');
 * }
 * 
 * @throws {Error} 当令牌无效、过期或签名错误时
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch {
    throw new Error('无效的刷新令牌');
  }
}; 