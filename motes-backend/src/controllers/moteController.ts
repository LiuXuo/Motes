/**
 * 脑图笔记控制器
 * 
 * 负责处理脑图笔记相关的 HTTP 请求，包括：
 * - 脑图笔记的获取和更新
 * - 脑图笔记的导入导出
 * - 脑图笔记数据验证
 * - 用户权限验证
 */

import { Request, Response } from 'express';
import { MoteService } from '../services/moteService';
import type { ApiError } from '../types/common';

/**
 * 通用错误处理函数
 * 
 * 统一处理控制器中的错误响应，确保错误格式的一致性。
 * 支持自定义错误状态码和错误信息。
 * 
 * @param {unknown} error - 捕获的错误对象
 * @param {Response} res - Express 响应对象
 * @param {string} operation - 操作名称，用于日志记录
 */
const handleError = (error: unknown, res: Response, operation: string) => {
  console.error(`${operation}错误:`, error);
  const apiError = error as ApiError;
  if (apiError.status) {
    return res.status(apiError.status).json({
      success: false,
      error: apiError.error,
    });
  }
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  });
};

/**
 * 脑图笔记控制器类
 * 
 * 处理所有脑图笔记相关的 HTTP 请求，包括获取、更新、导入和导出操作。
 * 提供统一的错误处理和响应格式，确保数据安全性。
 * 
 * @class MoteController
 */
export class MoteController {
  /**
   * 获取脑图笔记
   * 
   * 根据文档键获取用户的脑图笔记数据。
   * 验证用户权限并返回完整的脑图笔记树结构。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/mote/:docKey
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当脑图笔记不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async getMote(req: Request, res: Response) {
    try {
      const { docKey } = req.params;
      const userId = req.user!.userId;
      
      const result = await MoteService.getMote(docKey, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '获取脑图笔记');
    }
  }

  /**
   * 更新脑图笔记
   * 
   * 更新指定文档的脑图笔记树结构。
   * 验证数据格式并保存到数据库。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * PUT /api/mote/:docKey
   * {
   *   "moteTree": {
   *     "id": "root",
   *     "text": "根节点",
   *     "children": [...]
   *   }
   * }
   * 
   * @throws {400} 当脑图笔记数据格式错误时
   * @throws {401} 当用户未认证时
   * @throws {404} 当脑图笔记不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async updateMote(req: Request, res: Response) {
    try {
      const { docKey } = req.params;
      const { moteTree } = req.body;
      const userId = req.user!.userId;

      if (!moteTree) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '脑图树不能为空',
          },
        });
      }

      const result = await MoteService.updateMote(docKey, moteTree, userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      handleError(error, res, '更新脑图笔记');
    }
  }

  /**
   * 导出脑图笔记
   * 
   * 将脑图笔记数据导出为指定格式（JSON、Markdown等）。
   * 支持多种导出格式，便于数据备份和迁移。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/mote/:docKey/export?format=json
   * GET /api/mote/:docKey/export?format=markdown
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当脑图笔记不存在时
   * @throws {400} 当导出格式不支持时
   * @throws {500} 当服务器内部错误时
   */
  static async exportMote(req: Request, res: Response) {
    try {
      const { docKey } = req.params;
      const { format = 'json' } = req.query;
      const userId = req.user!.userId;

      const result = await MoteService.exportMote(docKey, format as string, userId);

      // 设置响应头确保UTF-8编码
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '导出脑图笔记');
    }
  }

  /**
   * 导入脑图笔记
   * 
   * 从外部数据源导入脑图笔记数据。
   * 支持多种导入格式，自动验证数据完整性。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/mote/import
   * {
   *   "parentKey": "parent-doc-key",
   *   "moteTree": {...},
   *   "title": "导入的笔记",
   *   "format": "json"
   * }
   * 
   * @throws {400} 当必填参数缺失时
   * @throws {400} 当数据格式错误时
   * @throws {401} 当用户未认证时
   * @throws {404} 当父文档不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async importMote(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { parentKey, moteTree, markdownContent, title = '导入的笔记', format = 'json' } = req.body;

      if (!parentKey) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '父文档Key不能为空',
          },
        });
      }

      const result = await MoteService.importMote(parentKey, moteTree, markdownContent, title, format, userId);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '导入脑图笔记');
    }
  }
} 