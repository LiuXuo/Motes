/**
 * 用户数据模型
 * 
 * 定义用户相关的数据结构和业务逻辑，包括：
 * - 用户基本信息管理
 * - 密码加密和验证
 * - 数据验证规则
 * - 数据库索引优化
 * 
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * 用户文档接口
 * 
 * 定义用户文档的数据结构，包括：
 * - 用户唯一标识符
 * - 用户名和邮箱信息
 * - 加密后的密码
 * - 创建和更新时间
 * - 密码比较方法
 * 
 * @interface IUser
 * @extends {Document}
 */
export interface IUser extends Document {
  /** 用户唯一标识符 */
  _id: mongoose.Types.ObjectId
  
  /** 用户名，2-20个字符，唯一 */
  username: string
  
  /** 邮箱地址，唯一，自动转小写 */
  email: string
  
  /** 加密后的密码，最少6个字符 */
  password: string
  
  /** 创建时间 */
  createdAt: Date
  updatedAt: Date
  
  /**
   * 密码比较方法
   * @param {string} candidatePassword - 待比较的密码
   * @returns {Promise<boolean>} 密码是否匹配
   */
  // eslint-disable-next-line
  comparePassword(_candidatePassword: string): Promise<boolean>
}

/**
 * 用户数据模式
 * 
 * 定义用户数据的验证规则和中间件：
 * - 字段验证（长度、格式、唯一性）
 * - 密码自动加密
 * - 时间戳自动更新
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true,
      trim: true,
      minlength: [2, '用户名至少2个字符'],
      maxlength: [20, '用户名最多20个字符'],
    },
    email: {
      type: String,
      required: [true, '邮箱不能为空'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确'],
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少6个字符'],
    },
  },
  {
    timestamps: true,
  },
);

/**
 * 密码加密中间件
 * 
 * 在保存用户数据前自动加密密码，使用 bcrypt 算法。
 * 只有在密码被修改时才重新加密，避免重复加密。
 * 
 * @param {Function} next - Mongoose 中间件回调函数
 */
userSchema.pre('save', async function (next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * 密码比较方法
 * 
 * 使用 bcrypt 比较用户输入的密码与数据库中存储的加密密码。
 * 
 * @param {string} candidatePassword - 待验证的密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 