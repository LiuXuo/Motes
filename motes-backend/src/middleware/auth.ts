/**
 * JWT 认证中间件
 * 
 * 负责处理用户身份验证，包括：
 * - JWT 令牌验证
 * - 用户信息提取和注入
 * - 用户存在性验证
 * - 错误处理和响应
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';

/**
 * 扩展 Express Request 接口
 * 
 * 为请求对象添加用户信息字段，使控制器能够访问当前认证用户的信息。
 */
declare global {
  // eslint-disable-next-line
  namespace Express {
    // eslint-disable-next-line
    interface Request {
      /** 当前认证用户的信息 */
      user?: JWTPayload
    }
  }
}

/**
 * JWT 认证中间件
 * 
 * 验证请求头中的 Authorization 令牌，提取用户信息并添加到请求对象中。
 * 支持 Bearer Token 格式，自动处理令牌过期和无效情况。
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - Express 下一个中间件函数
 * 
 * @throws {401} 当令牌缺失时
 * @throws {401} 当令牌无效或过期时
 * @throws {401} 当用户不存在时
 * 
 * @example
 * // 在路由中使用
 * router.get('/protected', authenticateToken, (req, res) => {
 *   console.log(req.user); // 访问用户信息
 * });
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权访问',
          details: '缺少访问令牌',
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    
    // 验证用户是否仍然存在
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权访问',
          details: '用户不存在',
        },
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未授权访问',
        details: error instanceof Error ? error.message : 'Token验证失败',
      },
    });
  }
}; 