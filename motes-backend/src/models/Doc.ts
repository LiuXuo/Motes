/**
 * 文档数据模型
 * 
 * 定义文档树相关的数据结构和业务逻辑，包括：
 * - 文档树节点管理
 * - 文件夹和脑图笔记节点
 * - 软删除和恢复功能
 * - 递归树结构支持
 * 
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * 文档节点接口
 * 
 * 定义文档树中单个节点的数据结构，支持文件夹和脑图笔记两种类型。
 * 节点采用递归结构，可以包含子节点。
 * 
 * @interface IDocNode
 */
export interface IDocNode {
  /** 节点唯一标识符 */
  key: string
  
  /** 节点标题 */
  title: string
  
  /** 节点类型：文件夹或脑图笔记 */
  type: 'folder' | 'mote'
  
  /** 是否已软删除 */
  isDeleted?: boolean
  
  /** 子节点列表 */
  children?: IDocNode[]
}

/**
 * 文档接口
 * 
 * 定义用户文档的数据结构，每个用户对应一个文档树。
 * 文档树采用嵌套结构，支持无限层级的节点组织。
 * 
 * @interface IDoc
 * @extends {Document}
 */
export interface IDoc extends Document {
  /** 所属用户ID */
  userId: mongoose.Types.ObjectId
  
  /** 文档树根节点 */
  docTree: IDocNode
  
  /** 创建时间 */
  createdAt: Date
  
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 文档节点数据模式
 * 
 * 定义文档节点的验证规则和默认值：
 * - 必填字段验证
 * - 节点类型枚举
 * - 软删除标记
 * - 递归子节点结构
 */
const docNodeSchema = new Schema<IDocNode>({
  key: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['folder', 'mote'],
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  children: [{
    type: Schema.Types.Mixed, // 递归结构
    default: [],
  }],
}, { _id: false });

/**
 * 文档数据模式
 * 
 * 定义文档数据的验证规则和索引：
 * - 用户关联
 * - 文档树结构
 * - 时间戳自动更新
 * - 数据库索引优化
 */
const docSchema = new Schema<IDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    docTree: {
      type: docNodeSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * 创建数据库索引
 * 
 * 优化查询性能：
 * - 用户ID唯一索引：确保每个用户只有一个文档树
 * - 复合索引：支持按用户ID和节点key快速查询
 */
docSchema.index({ userId: 1 }, { unique: true }); // 每个用户只有一个文档树
docSchema.index({ userId: 1, 'docTree.key': 1 });

export const Doc = mongoose.model<IDoc>('Doc', docSchema); 