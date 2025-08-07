import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 用户注册
router.post('/register', UserController.register);

// 用户登录
router.post('/login', UserController.login);

// 用户登出
router.post('/logout', authenticateToken, UserController.logout);

// 刷新Token
router.post('/refresh', UserController.refresh);

export default router; 