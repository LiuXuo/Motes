import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { outlineToMote } from '../utils/outlineToMote';
import { parseUploadedDocument, type UploadedFile } from '../services/documentParser';
import { preprocessText } from '../services/textPreprocess';

export class AIController {
  // POST /api/ai/generate-mote
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
        depthLimit: options?.depthLimit ?? 3,
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
      const debugRaw = (req.query.debug === 'true' || req.body?.debug === true) ? llm.getLastRawContent() : undefined;
      return res.json({
        success: true,
        data: {
          title: title || outline.title,
          moteTree,
          docParentKey,
          created: false,
          rawContent: debugRaw,
          fallbackUsed: llm.getLastUsedFallback(),
        },
      });
    } catch (error: any) {
      if (error?.status) {
        return res.status(error.status).json({ success: false, error: error.error });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '生成失败',
          details: error?.message,
        },
      });
    }
  }

  // POST /api/ai/generate-mote-file (multipart/form-data)
  static async generateMoteFromFile(req: Request, res: Response) {
    try {
      const file = (req as any).file as UploadedFile | undefined;
      if (!file) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少上传文件' } });
      }

      // 解析 form-data 字段
      const docParentKey = String((req.body?.docParentKey ?? '') as string);
      const title = (req.body?.title as string) || '';
      const create = String(req.body?.create || 'false') === 'true';
      const debug = String(req.body?.debug || 'false') === 'true';
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
        depthLimit: options?.depthLimit ?? 3,
        branchingFactor: options?.branchingFactor ?? 4,
        language: options?.language ?? '中文',
        maxTokens: Math.min(options?.maxTokens ?? 1200, 2000),
      };
      const outline = await llm.generateOutline({ inputType: 'text', text: cleaned }, mergedOptions);
      const moteTree = outlineToMote(outline);

      const debugRaw = debug ? llm.getLastRawContent() : undefined;
      return res.json({
        success: true,
        data: {
          title: title || outline.title,
          moteTree,
          docParentKey,
          created: create && false,
          rawContent: debugRaw,
          fallbackUsed: llm.getLastUsedFallback(),
          parsedMeta: parsed.meta,
        },
      });
    } catch (error: any) {
      if (error?.status) {
        return res.status(error.status).json({ success: false, error: error.error });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '文件生成失败',
          details: error?.message,
        },
      });
    }
  }
}


