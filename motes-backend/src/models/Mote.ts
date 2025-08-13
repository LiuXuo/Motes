/**
 * 脑图笔记数据模型
 * 
 * 定义脑图笔记相关的数据结构和业务逻辑，包括：
 * - 脑图节点管理
 * - 节点层级关系
 * - 节点折叠状态
 * - 递归树结构支持
 * 
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * 脑图节点接口
 * 
 * 定义脑图中单个节点的数据结构，支持层级组织和折叠功能。
 * 节点采用递归结构，可以包含子节点。
 * 
 * @interface IMoteNode
 */
export interface IMoteNode {
  /** 节点唯一标识符 */
  id: string
  
  /** 节点文本内容 */
  text: string
  
  /** 节点是否折叠 */
  collapsed: boolean
  
  /** 父节点ID，根节点为null */
  parentId: string
  
  /** 子节点列表 */
  children?: IMoteNode[]
}

/**
 * 脑图笔记接口
 * 
 * 定义脑图笔记的数据结构，每个文档节点对应一个脑图笔记。
 * 脑图采用嵌套结构，支持无限层级的节点组织。
 * 
 * @interface IMote
 * @extends {Document}
 */
export interface IMote extends Document {
  /** 关联的文档节点ID */
  docId: string
  
  /** 脑图树根节点 */
  moteTree: IMoteNode
  
  /** 创建时间 */
  createdAt: Date
  
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 脑图节点数据模式
 * 
 * 定义脑图节点的验证规则和默认值：
 * - 必填字段验证
 * - 节点折叠状态
 * - 父子关系管理
 * - 递归子节点结构
 */
const moteNodeSchema = new Schema<IMoteNode>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  parentId: {
    type: String,
    required: true,
  },
  children: [{
    type: Schema.Types.Mixed, // 递归结构
    default: [],
  }],
}, { _id: false });

/**
 * 脑图笔记数据模式
 * 
 * 定义脑图笔记数据的验证规则和索引：
 * - 文档关联
 * - 脑图树结构
 * - 时间戳自动更新
 * - 数据库索引优化
 */
const moteSchema = new Schema<IMote>(
  {
    docId: {
      type: String,
      required: true,
    },
    moteTree: {
      type: moteNodeSchema,
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
 * - 文档ID唯一索引：确保每个文档节点对应一个脑图笔记
 */
moteSchema.index({ docId: 1 }, { unique: true }); // 每个文档节点对应一个脑图笔记

export const Mote = mongoose.model<IMote>('Mote', moteSchema); 