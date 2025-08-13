/**
 * 数据库连接配置文件
 * 
 * 负责 MongoDB 数据库的连接管理，包括：
 * - 数据库连接配置
 * - 连接状态管理
 * - 错误处理和重连机制
 * - 优雅关闭连接
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/** MongoDB 连接字符串，优先使用环境变量配置 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/motes';

/**
 * 连接数据库
 * 
 * 建立与 MongoDB 数据库的连接，使用环境变量中的连接字符串。
 * 连接失败时会终止应用程序进程。
 * 
 * @returns {Promise<void>} 连接成功时 resolve
 * @throws {Error} 连接失败时抛出错误并终止进程
 * 
 * @example
 * // 在应用启动时调用
 * await connectDB();
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

/**
 * 断开数据库连接
 * 
 * 优雅地关闭与 MongoDB 数据库的连接。
 * 通常在应用程序关闭时调用，确保数据完整性。
 * 
 * @returns {Promise<void>} 断开连接成功时 resolve
 * 
 * @example
 * // 在应用关闭时调用
 * await disconnectDB();
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB 连接已断开');
  } catch (error) {
    console.error('❌ MongoDB 断开连接失败:', error);
  }
}; 