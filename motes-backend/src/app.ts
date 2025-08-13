/**
 * Motes API 应用入口文件
 * 
 * 主要功能：
 * - 配置 Express 服务器
 * - 注册中间件和路由
 * - 处理全局错误
 * - 启动数据库连接
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/user';
import docRoutes from './routes/doc';
import moteRoutes from './routes/mote';
import aiRoutes from './routes/ai';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// 增大 JSON 请求体与处理超时
app.set('json spaces', 0);

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 路由
app.use('/api/user', userRoutes);
app.use('/api/doc', docRoutes);
app.use('/api/mote', moteRoutes);
app.use('/api/ai', aiRoutes);

/**
 * 健康检查接口
 * 
 * 用于监控服务状态，返回服务运行状态和当前时间戳
 * 
 * @param {express.Request} req - Express 请求对象
 * @param {express.Response} res - Express 响应对象
 * 
 * @example
 * GET /api/health
 * 
 * 响应示例：
 * {
 *   "success": true,
 *   "message": "Motes API 服务运行正常",
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Motes API 服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 错误处理
 * 
 * 捕获所有未匹配的路由，返回标准化的 404 错误响应
 * 
 * @param {express.Request} req - Express 请求对象
 * @param {express.Response} res - Express 响应对象
 * 
 * @throws {404} 当请求的接口不存在时
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在',
    },
  });
});

/**
 * 全局错误处理中间件
 * 
 * 捕获所有未处理的错误，记录错误日志并返回标准化的错误响应
 * 
 * @param {Error | unknown} err - 错误对象
 * @param {express.Request} _req - Express 请求对象（未使用）
 * @param {express.Response} res - Express 响应对象
 * 
 * @throws {500} 当服务器内部错误时
 */
app.use((err: Error | unknown, _req: express.Request, res: express.Response) => {
  console.error('服务器错误:', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  });
});

/**
 * 启动服务器
 * 
 * 异步启动服务器，包括：
 * - 连接 MongoDB 数据库
 * - 启动 Express 服务器
 * - 输出启动信息
 * 
 * @returns {Promise<void>}
 * 
 * @throws {Error} 当数据库连接失败时
 * @throws {Error} 当服务器启动失败时
 */
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log('🚀 Motes API 服务器启动成功');
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app; 