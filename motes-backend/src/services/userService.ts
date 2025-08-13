/**
 * 用户服务类
 * 
 * 负责用户相关的业务逻辑，包括：
 * - 用户注册和登录
 * - 密码验证和加密
 * - JWT 令牌管理
 * - 用户信息管理
 */

import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

/**
 * 用户服务类
 * 
 * 负责用户相关的业务逻辑，包括：
 * - 用户注册和登录
 * - 密码验证和加密
 * - JWT 令牌管理
 * - 用户信息管理
 * 
 * @class UserService
 */
export class UserService {
  /**
   * 用户注册
   * 
   * 创建新用户账户，包括用户名、邮箱和密码验证。
   * 自动生成访问令牌和刷新令牌。
   * 
   * @param {string} username - 用户名
   * @param {string} email - 邮箱地址
   * @param {string} password - 密码
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>} 注册结果
   * 
   * @throws {409} 当用户名或邮箱已存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await UserService.register('testuser', 'test@example.com', 'password123');
   * console.log(result.user.username); // 输出: 'testuser'
   * console.log(result.token); // 输出: JWT访问令牌
   */
  static async register(username: string, email: string, password: string) {
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw {
        status: 409,
        error: {
          code: 'USER_EXISTS',
          message: '用户已存在',
          details: existingUser.username === username ? '用户名已存在' : '邮箱已存在',
        },
      };
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // 生成令牌
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * 用户登录
   * 
   * 验证用户凭据并生成访问令牌。
   * 支持用户名或邮箱登录。
   * 
   * @param {string} username - 用户名或邮箱
   * @param {string} password - 密码
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>} 登录结果
   * 
   * @throws {401} 当用户名或密码错误时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await UserService.login('testuser', 'password123');
   * console.log(result.user.username); // 输出: 'testuser'
   * console.log(result.token); // 输出: JWT访问令牌
   */
  static async login(username: string, password: string) {
    // 查找用户
    const user = await User.findOne({
      $or: [{ username }, { email: username }], // 支持用户名或邮箱登录
    });

    if (!user) {
      throw {
        status: 401,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '登录失败',
          details: '用户名或密码错误',
        },
      };
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw {
        status: 401,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '登录失败',
          details: '用户名或密码错误',
        },
      };
    }

    // 生成令牌
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * 刷新Token
   * 
   * 使用刷新令牌生成新的访问令牌和刷新令牌。
   * 验证刷新令牌的有效性和用户存在性。
   * 
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<{token: string, refreshToken: string}>} 新的令牌对
   * 
   * @throws {401} 当刷新令牌无效或用户不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await UserService.refresh('refresh_token_string');
   * console.log(result.token); // 输出: 新的JWT访问令牌
   * console.log(result.refreshToken); // 输出: 新的刷新令牌
   */
  static async refresh(refreshToken: string) {
    // 验证刷新令牌
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    // 验证用户是否存在
    const user = await User.findById(payload.userId);
    if (!user) {
      throw {
        status: 401,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权访问',
          details: '用户不存在',
        },
      };
    }

    // 生成新的令牌
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
} 