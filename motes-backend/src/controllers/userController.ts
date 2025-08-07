import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  // 用户注册
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
    } catch (error: any) {
      console.error('注册错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
        });
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      });
    }
  }

  // 用户登录
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
    } catch (error: any) {
      console.error('登录错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
        });
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      });
    }
  }

  // 用户登出
  static async logout(req: Request, res: Response) {
    // 在实际应用中，你可能需要将token加入黑名单
    // 这里我们只是返回成功响应
    res.json({
      success: true,
      message: '登出成功',
    });
  }

  // 刷新Token
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
    } catch (error: any) {
      console.error('刷新令牌错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
        });
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      });
    }
  }
} 