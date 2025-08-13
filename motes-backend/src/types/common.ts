/**
 * 通用类型定义文件
 * 
 * 定义 Motes API 中使用的所有通用类型和接口，包括：
 * - API 响应格式
 * - 错误处理类型
 * - 数据结构类型
 * - 工具函数类型
 * - AI 服务相关类型
 * 
 */
import { Request, Response } from 'express';
import { IMoteNode } from '../models/Mote';
import { IDocNode } from '../models/Doc';

/**
 * API 错误格式
 * 
 * 定义标准化的错误响应格式，便于前端错误处理和用户提示
 */
export interface ApiError {
  /** HTTP 状态码 */
  status: number;
  /** 错误详情 */
  error: {
    /** 错误代码，用于程序化处理 */
    code: string;
    /** 错误消息，用于用户显示 */
    message: string;
    /** 错误详情，用于调试 */
    details?: string;
  };
}

/**
 * API 响应格式
 * 
 * 定义所有 API 响应的标准格式，确保前端能够统一处理响应数据
 * 
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T = unknown> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据，仅在成功时存在 */
  data?: T;
  /** 错误信息，仅在失败时存在 */
  error?: ApiError['error'];
}

/**
 * 请求体类型
 * 
 * 定义动态请求体的类型，支持任意键值对
 */
export interface RequestBody {
  [key: string]: unknown;
}

/**
 * 错误处理函数类型
 * 
 * 定义统一的错误处理函数签名，用于标准化错误处理流程
 */
// eslint-disable-next-line
export type ErrorHandler = (error: unknown) => ApiError;

/**
 * 递归节点类型
 * 
 * 定义具有递归结构的节点类型，用于文档树和脑图笔记的数据结构
 * 
 * @template T - 节点数据类型
 */
export type RecursiveNode<T> = T & {
  /** 子节点列表 */
  children?: RecursiveNode<T>[];
};

/**
 * 文档树节点类型
 * 
 * 定义文档树中节点的数据结构，支持层级嵌套
 */
export type DocTreeNode = RecursiveNode<IDocNode>;

/**
 * 脑图笔记节点类型
 * 
 * 定义脑图笔记中节点的数据结构，支持层级嵌套
 */
export type MoteTreeNode = RecursiveNode<IMoteNode>;

/**
 * 清理后的脑图笔记节点类型
 * 
 * 只包含 text 和 children 字段，用于简化的脑图笔记数据结构
 */
export type CleanMoteTreeNode = {
  /** 节点文本内容 */
  text: string;
  /** 子节点列表 */
  children?: CleanMoteTreeNode[];
};

/**
 * 通用节点操作类型
 * 
 * 定义对节点进行各种操作的数据结构
 */
export interface NodeOperation {
  /** 节点ID */
  id: string;
  /** 操作类型 */
  type: 'create' | 'update' | 'delete' | 'move' | 'duplicate';
  /** 操作数据 */
  data?: unknown;
}

/**
 * 文件上传类型
 * 
 * 定义上传文件的数据结构，包含文件的所有元信息
 */
export interface UploadedFile {
  /** 表单字段名 */
  fieldname: string;
  /** 原始文件名 */
  originalname: string;
  /** 文件编码 */
  encoding: string;
  /** MIME 类型 */
  mimetype: string;
  /** 文件内容缓冲区 */
  buffer: Buffer;
  /** 文件大小（字节） */
  size: number;
}

/**
 * 用户信息类型
 * 
 * 定义用户的基本信息结构，用于 API 响应和内部处理
 */
export interface UserInfo {
  /** 用户唯一标识符 */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱地址 */
  email: string;
}

/**
 * JWT 载荷类型
 * 
 * 定义 JWT 令牌中存储的用户信息
 */
export interface JwtPayload {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 签发时间 */
  iat?: number;
  /** 过期时间 */
  exp?: number;
}

/**
 * 数据库查询结果类型
 * 
 * 定义数据库操作的统一返回格式
 * 
 * @template T - 查询结果的数据类型
 */
export interface QueryResult<T> {
  /** 操作是否成功 */
  success: boolean;
  /** 查询结果数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
}

/**
 * 分页参数类型
 * 
 * 定义分页查询的参数结构
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sort?: string;
  /** 排序方向 */
  order?: 'asc' | 'desc';
}

/**
 * 搜索参数类型
 * 
 * 定义搜索功能的参数结构
 */
export interface SearchParams {
  /** 搜索关键词 */
  query: string;
  /** 搜索字段列表 */
  fields?: string[];
  /** 是否区分大小写 */
  caseSensitive?: boolean;
}

/**
 * AI 服务配置类型
 * 
 * 定义 AI 服务提供商的配置信息
 */
export interface AiProvider {
  /** 服务提供商类型 */
  type: string;
  /** 使用的模型名称 */
  model: string;
  /** API 密钥 */
  apiKey?: string;
  /** 基础 URL */
  baseUrl?: string;
}

/**
 * AI 生成选项类型
 * 
 * 定义 AI 生成内容时的配置选项
 */
export interface AiOptions {
  /** 最大新节点数量 */
  maxNewNodes?: number;
  /** 生成深度 */
  depth?: number;
  /** 生成语言 */
  language?: string;
  /** 生成温度（创造性） */
  temperature?: number;
  /** 最大令牌数 */
  maxTokens?: number;
}

/**
 * 文档解析结果类型
 * 
 * 定义文档解析后的数据结构
 */
export interface ParsedDocument {
  /** 解析后的文本内容 */
  text: string;
  /** 文档元信息 */
  meta: {
    /** MIME 类型 */
    mimeType?: string;
    /** 文件名 */
    fileName?: string;
    /** 文件扩展名 */
    ext?: string;
    /** 文档来源类型 */
    source: 'pdf' | 'docx' | 'markdown' | 'text' | 'unknown';
  };
}

/**
 * 通用回调函数类型
 * 
 * 定义标准的回调函数签名，用于异步操作
 * 
 * @template T - 回调结果的数据类型
 */
// eslint-disable-next-line
export type Callback<T = void> = (_error?: Error | null, _result?: T) => void;

/**
 * 异步函数类型
 * 
 * 定义通用的异步函数签名
 * 
 * @template T - 异步函数的返回类型
 */
// eslint-disable-next-line
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * 中间件函数类型
 * 
 * 定义 Express 中间件函数的签名
 */
// eslint-disable-next-line
export type Middleware = (req: Request, res: Response, next: () => void) => void | Promise<void>;

/**
 * 控制器方法类型
 * 
 * 定义 Express 控制器方法的签名
 */
// eslint-disable-next-line
export type ControllerMethod = (req: Request, res: Response) => Promise<void>;

/**
 * 服务方法类型
 * 
 * 定义服务层方法的签名
 * 
 * @template T - 服务方法的返回类型
 */
// eslint-disable-next-line
export type ServiceMethod<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * 工具函数类型
 * 
 * 定义工具函数的签名
 * 
 * @template T - 工具函数的返回类型
 */
// eslint-disable-next-line
export type UtilityFunction<T = unknown> = (...args: unknown[]) => T;
