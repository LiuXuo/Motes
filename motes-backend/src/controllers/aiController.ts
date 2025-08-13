/**
 * AI 控制器
 * 
 * 负责处理 AI 相关的 HTTP 请求，包括：
 * - AI 生成思维导图
 * - 文档解析和预处理
 * - 节点扩展和优化
 * - LLM 服务集成
 */

import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { outlineToMote } from '../utils/outlineToMote';
import { parseUploadedDocument } from '../services/documentParser';
import { preprocessText } from '../services/textPreprocess';
import type { ApiError, MoteTreeNode } from '../types/common';

/**
 * AI 控制器类
 * 
 * 处理所有 AI 相关的 HTTP 请求，包括思维导图生成、文档解析和节点扩展。
 * 集成多种 LLM 服务，提供智能化的文档处理功能。
 * 
 * @class AIController
 */
export class AIController {
  /**
   * 生成思维导图
   * 
   * 根据用户输入的主题或文本，使用 AI 生成结构化的思维导图。
   * 支持多种输入类型和生成选项，返回标准化的思维导图树结构。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/ai/generate-mote
   * {
   *   "inputType": "theme",
   *   "theme": "人工智能发展史",
   *   "docParentKey": "parent-key",
   *   "title": "AI发展史",
   *   "provider": {
   *     "type": "openai",
   *     "model": "gpt-3.5-turbo"
   *   },
   *   "options": {
   *     "depthLimit": 4,
   *     "branchingFactor": 4,
   *     "language": "中文"
   *   }
   * }
   * 
   * @throws {400} 当缺少必要参数时
   * @throws {400} 当输入类型无效时
   * @throws {500} 当 AI 服务调用失败时
   */
  static async generateMote(req: Request, res: Response) {
    try {
      const {
        inputType,
        theme,
        text,
        docParentKey,
        title,
        options,
        provider,
      } = req.body || {};

      // 基础校验（雏形，详细可后续用 Zod/Joi 强化）
      if (!inputType || !docParentKey || !provider?.type || !provider?.model) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: '缺少必要参数' },
        });
      };

      const llm = new LLMService(provider);
      // 合理的默认参数，避免生成过慢
      const mergedOptions = {
        depthLimit: options?.depthLimit ?? 4,
        branchingFactor: options?.branchingFactor ?? 4,
        language: options?.language ?? '中文',
        maxTokens: Math.min(options?.maxTokens ?? 1200, 2000),
      };
      const outline = await llm.generateOutline(
        { inputType, theme, text },
        mergedOptions,
      );

      // 规范化为项目 MoteNode 结构
      const moteTree = outlineToMote(outline);

      // 先不直落入库，仅返回预览数据；create=true 的直落逻辑后续再接
      return res.json({
        success: true,
        data: {
          title: title || outline.title,
          moteTree,
          docParentKey,
          created: false,
          fallbackUsed: llm.getLastUsedFallback(),
        },
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError?.status) {
        return res.status(apiError.status).json({ success: false, error: apiError.error });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '生成失败',
          details: error instanceof Error ? error.message : '未知错误',
        },
      });
    }
  }

  /**
   * 从文件生成思维导图
   * 
   * 解析上传的文档文件，提取文本内容并使用 AI 生成思维导图。
   * 支持多种文档格式，包括 PDF、Word、MD 等。
   * 
   * @param {Request} req - Express 请求对象，包含上传的文件
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/ai/generate-mote-file
   * Content-Type: multipart/form-data
   * 
   * Form Data:
   * - file: 上传的文档文件
   * - docParentKey: 父文档键
   * - title: 生成的标题
   * - create: 是否直接创建
   * - provider: LLM 提供商配置
   * - options: 生成选项
   * 
   * @throws {400} 当缺少上传文件时
   * @throws {400} 当文档格式不支持时
   * @throws {400} 当无法提取有效文本时
   * @throws {500} 当 AI 服务调用失败时
   */
  static async generateMoteFromFile(req: Request, res: Response) {
    try {
      const file = (req as { file?: { mimetype: string; originalname: string; buffer: Buffer } }).file;
      if (!file) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少上传文件' } });
      }

      // 解析 form-data 字段
      const docParentKey = String((req.body?.docParentKey ?? '') as string);
      const title = (req.body?.title as string) || '';
      const create = String(req.body?.create || 'false') === 'true';
      const providerRaw = req.body?.provider;
      const optionsRaw = req.body?.options;

      if (!docParentKey) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少 docParentKey' } });
      }

      const provider = typeof providerRaw === 'string' ? JSON.parse(providerRaw) : providerRaw;
      const options = typeof optionsRaw === 'string' ? JSON.parse(optionsRaw) : optionsRaw;

      if (!provider?.type || !provider?.model) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少 provider 配置' } });
      }

      // 1) 文档解析
      const parsed = await parseUploadedDocument(file);
      // 2) NLP 预处理
      const cleaned = preprocessText(parsed.text);
      if (!cleaned) {
        return res.status(400).json({ success: false, error: { code: 'EMPTY_CONTENT', message: '无法从文档中提取有效文本' } });
      }

      // 3) 交给 LLM 做结构化大纲抽取
      const llm = new LLMService(provider);
      const mergedOptions = {
        depthLimit: options?.depthLimit ?? 4,
        branchingFactor: options?.branchingFactor ?? 4,
        language: options?.language ?? '中文',
        maxTokens: Math.min(options?.maxTokens ?? 1200, 2000),
      };
      const outline = await llm.generateOutline({ inputType: 'text', text: cleaned }, mergedOptions);
      const moteTree = outlineToMote(outline);

      return res.json({
        success: true,
        data: {
          title: title || outline.title,
          moteTree,
          docParentKey,
          created: create && false,
          fallbackUsed: llm.getLastUsedFallback(),
          parsedMeta: parsed.meta,
        },
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError?.status) {
        return res.status(apiError.status).json({ success: false, error: apiError.error });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '文件生成失败',
          details: error instanceof Error ? error.message : '未知错误',
        },
      });
    }
  }

  /**
   * 扩展思维导图节点
   * 
   * 对选中的思维导图节点进行 AI 扩展，生成新的子节点。
   * 基于现有节点内容，智能生成相关的分支结构。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/ai/expand-node
   * {
   *   "moteTree": {...},
   *   "selectedNodeId": "node-123",
   *   "selectedNodeText": "人工智能",
   *   "provider": {
   *     "type": "openai",
   *     "model": "gpt-3.5-turbo"
   *   },
   *   "options": {
   *     "maxNewNodes": 4,
   *     "depth": 2,
   *     "language": "中文"
   *   }
   * }
   * 
   * @throws {400} 当缺少必要参数时
   * @throws {400} 当选中节点不存在时
   * @throws {500} 当 AI 服务调用失败时
   */
  static async expandNode(req: Request, res: Response) {
    try {
      const {
        moteTree,
        selectedNodeId,
        selectedNodeText,
        provider,
        options,
      } = req.body || {};

      // 参数验证
      if (!moteTree || !selectedNodeId || !selectedNodeText || !provider?.type || !provider?.model) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: '缺少必要参数' },
        });
      }

      const llm = new LLMService(provider);
      
      // 将整个moteTree传给LLM，标记选中节点
      const markedTree = markSelectedNode(moteTree, selectedNodeId);
      
      // 生成扩展节点
      const expandedNode = await llm.expandNode({
        moteTree: markedTree,
        selectedNodeText,
        options: {
          maxNewNodes: Math.min(options?.maxNewNodes ?? 4, 16),
          depth: Math.min(options?.depth ?? 4, 16),
          language: options?.language ?? '中文',
        },
      });

      return res.json({
        success: true,
        data: {
          expandedNode,
          fallbackUsed: llm.getLastUsedFallback(),
        },
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError?.status) {
        return res.status(apiError.status).json({ success: false, error: apiError.error });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'AI生枝失败',
          details: error instanceof Error ? error.message : '未知错误',
        },
      });
    }
  }
}

/**
 * 标记选中节点的工具函数
 * 
 * 在思维导图树中标记选中的节点，用于 AI 扩展时提供上下文信息。
 * 将选中节点的文本用特殊标记包围，便于 LLM 识别。
 * 
 * @param {MoteTreeNode} tree - 思维导图树结构
 * @param {string} selectedNodeId - 选中节点的ID
 * @returns {MoteTreeNode} 标记后的思维导图树
 */
function markSelectedNode(tree: MoteTreeNode, selectedNodeId: string): MoteTreeNode {
  function markNode(node: MoteTreeNode): MoteTreeNode {
    if (node.id === selectedNodeId) {
      return {
        ...node,
        text: `***${node.text}***`,
        children: node.children ? node.children.map(markNode) : [],
      };
    }
    
    return {
      ...node,
      children: node.children ? node.children.map(markNode) : [],
    };
  }
  
  return markNode(tree);
}


