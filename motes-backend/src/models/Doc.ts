import mongoose, { Document, Schema } from 'mongoose';

export interface IDocNode {
  key: string
  title: string
  type: 'folder' | 'mote'
  isDeleted?: boolean
  children?: IDocNode[]
}

export interface IDoc extends Document {
  userId: mongoose.Types.ObjectId
  docTree: IDocNode
  createdAt: Date
  updatedAt: Date
}

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

// 创建索引
docSchema.index({ userId: 1 }, { unique: true }); // 每个用户只有一个文档树
docSchema.index({ userId: 1, 'docTree.key': 1 });

export const Doc = mongoose.model<IDoc>('Doc', docSchema); 