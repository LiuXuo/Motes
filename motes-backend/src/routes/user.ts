/**
 * 用户路由模块
 * 
 * 定义用户相关的 API 路由，包括：
 * - 用户注册和登录
 * - 用户登出和令牌刷新
 * - 身份验证中间件集成
 * 
 */

import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * 用户注册
 * 
 * 创建新用户账户，验证用户信息并加密密码。
 * 
 * @route POST /api/user/register
 * @param {string} username - 用户名，2-20个字符
 * @param {string} email - 邮箱地址
 * @param {string} password - 密码，最少6个字符
 * @returns {Object} 注册结果，包含用户信息和访问令牌
 * 
 * @throws {400} 当必填字段缺失或格式错误时
 * @throws {409} 当用户名或邮箱已存在时
 */
router.post('/register', UserController.register);

/**
 * 用户登录
 * 
 * 验证用户凭据并生成访问令牌。
 * 
 * @route POST /api/user/login
 * @param {string} email - 邮箱地址
 * @param {string} password - 密码
 * @returns {Object} 登录结果，包含用户信息和访问令牌
 * 
 * @throws {400} 当邮箱或密码缺失时
 * @throws {401} 当邮箱或密码错误时
 */
router.post('/login', UserController.login);

/**
 * 用户登出
 * 
 * 使当前用户的访问令牌失效。
 * 需要身份验证。
 * 
 * @route POST /api/user/logout
 * @returns {Object} 登出结果
 * 
 * @throws {401} 当用户未认证时
 */
router.post('/logout', authenticateToken, UserController.logout);

/**
 * 刷新访问令牌
 * 
 * 使用刷新令牌生成新的访问令牌。
 * 
 * @route POST /api/user/refresh
 * @param {string} refreshToken - 刷新令牌
 * @returns {Object} 新的访问令牌
 * 
 * @throws {400} 当刷新令牌缺失时
 * @throws {401} 当刷新令牌无效或过期时
 */
router.post('/refresh', UserController.refresh);

export default router; 