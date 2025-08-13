/**
 * 用户控制器
 * 
 * 负责处理用户相关的 HTTP 请求，包括：
 * - 用户注册和登录
 * - Token 管理和刷新
 * - 用户信息管理
 * - 认证状态验证
 */

import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import type { ApiError } from '../types/common';

/**
 * 通用错误处理函数
 * 
 * 统一处理控制器中的错误响应，确保错误格式的一致性。
 * 支持自定义错误状态码和错误信息。
 * 
 * @param {unknown} error - 捕获的错误对象
 * @param {Response} res - Express 响应对象
 * @param {string} operation - 操作名称，用于日志记录
 */
const handleError = (error: unknown, res: Response, operation: string) => {
  console.error(`${operation}错误:`, error);
  const apiError = error as ApiError;
  if (apiError.status) {
    return res.status(apiError.status).json({
      success: false,
      error: apiError.error,
    });
  }
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  });
};

/**
 * 用户控制器类
 * 
 * 处理所有用户相关的 HTTP 请求，包括注册、登录、登出和 Token 刷新。
 * 提供统一的错误处理和响应格式。
 * 
 * @class UserController
 */
export class UserController {
  /**
   * 用户注册
   * 
   * 处理新用户注册请求，验证用户输入并创建用户账户。
   * 注册成功后返回用户信息和访问令牌。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/user/register
   * {
   *   "username": "testuser",
   *   "email": "test@example.com",
   *   "password": "password123"
   * }
   * 
   * @throws {400} 当必填字段缺失时
   * @throws {409} 当用户名或邮箱已存在时
   * @throws {500} 当服务器内部错误时
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // 验证必填字段
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '用户名、邮箱和密码不能为空',
          },
        });
      }

      const result = await UserService.register(username, email, password);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '注册');
    }
  }

  /**
   * 用户登录
   * 
   * 验证用户凭据并生成访问令牌。
   * 登录成功后返回用户信息和访问令牌。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/user/login
   * {
   *   "username": "testuser",
   *   "password": "password123"
   * }
   * 
   * @throws {400} 当用户名或密码缺失时
   * @throws {401} 当用户名或密码错误时
   * @throws {500} 当服务器内部错误时
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '用户名和密码不能为空',
          },
        });
      }

      const result = await UserService.login(username, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '登录');
    }
  }

  /**
   * 用户登出
   * 
   * 处理用户登出请求。在实际应用中，可能需要将令牌加入黑名单。
   * 当前实现仅返回成功响应。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/user/logout
   * 
   * @throws {500} 当服务器内部错误时
   */
  static async logout(req: Request, res: Response) {
    // 在实际应用中，你可能需要将token加入黑名单
    // 这里我们只是返回成功响应
    res.json({
      success: true,
      message: '登出成功',
    });
  }

  /**
   * 刷新访问令牌
   * 
   * 使用刷新令牌生成新的访问令牌，延长用户会话时间。
   * 验证刷新令牌的有效性并生成新的访问令牌。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/user/refresh
   * {
   *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   * 
   * @throws {400} 当刷新令牌缺失时
   * @throws {401} 当刷新令牌无效或过期时
   * @throws {500} 当服务器内部错误时
   */
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '刷新令牌不能为空',
          },
        });
      }

      const result = await UserService.refresh(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '刷新令牌');
    }
  }
} 