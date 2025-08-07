import mongoose, { Document, Schema } from 'mongoose';

export interface IMoteNode {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: IMoteNode[]
}

export interface IMote extends Document {
  docId: string
  moteTree: IMoteNode
  createdAt: Date
  updatedAt: Date
}

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

// 创建索引
moteSchema.index({ docId: 1 }, { unique: true }); // 每个文档节点对应一个脑图笔记

export const Mote = mongoose.model<IMote>('Mote', moteSchema); 