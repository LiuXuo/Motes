import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export class UserService {
  // 用户注册
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

  // 用户登录
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

  // 刷新Token
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