import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';

// 扩展Request接口以包含用户信息
declare global {
  // eslint-disable-next-line
  namespace Express {
    // eslint-disable-next-line
    interface Request {
      user?: JWTPayload
    }
  }
}

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