/**
 * 文档控制器
 * 
 * 负责处理文档树相关的 HTTP 请求，包括：
 * - 文档树的获取和更新
 * - 文档节点的增删改查
 * - 文档节点的移动和重命名
 * - 文档的软删除和恢复
 */

import { Request, Response } from 'express';
import { DocService } from '../services/docService';
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
 * 文档控制器类
 * 
 * 处理所有文档树相关的 HTTP 请求，包括文档节点的完整生命周期管理。
 * 提供统一的错误处理和响应格式，确保数据完整性和用户权限验证。
 * 
 * @class DocController
 */
export class DocController {
  /**
   * 获取文档树
   * 
   * 获取用户的完整文档树结构，包括所有文档节点和层级关系。
   * 返回树形结构数据，便于前端渲染文档管理界面。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * GET /api/doc/tree
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当用户文档树不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async getDocTree(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const result = await DocService.getDocTree(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      console.error('获取文档树错误:', error);
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
    }
  }

  /**
   * 更新文档树
   * 
   * 更新用户的完整文档树结构。
   * 用于批量更新文档树，如拖拽排序等操作。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * PUT /api/doc/tree
   * {
   *   "docTree": {
   *     "key": "root",
   *     "title": "根目录",
   *     "children": [...]
   *   }
   * }
   * 
   * @throws {400} 当文档树数据格式错误时
   * @throws {401} 当用户未认证时
   * @throws {500} 当服务器内部错误时
   */
  static async updateDocTree(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { docTree } = req.body;

      if (!docTree) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '文档树不能为空',
          },
        });
      }

      const result = await DocService.updateDocTree(userId, docTree);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      console.error('更新文档树错误:', error);
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
    }
  }

  /**
   * 创建文档节点
   * 
   * 在指定父节点下创建新的文档节点。
   * 支持创建文件夹和思维导图两种类型的节点。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/doc/node
   * {
   *   "title": "新文档",
   *   "type": "mote",
   *   "parentKey": "parent-key"
   * }
   * 
   * @throws {400} 当必填字段缺失时
   * @throws {400} 当节点类型无效时
   * @throws {401} 当用户未认证时
   * @throws {404} 当父节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async createNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { title, type, parentKey } = req.body;

      // 验证必填字段
      if (!title || !type || !parentKey) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '标题、类型和父节点key不能为空',
          },
        });
      }

      const result = await DocService.createNode(userId, title, type, parentKey);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '创建文档节点');
    }
  }

  /**
   * 创建文档节点副本
   * 
   * 复制指定文档节点及其子节点结构。
   * 创建完整的节点副本，包括所有子节点。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/doc/node/:key/duplicate
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当源节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async duplicateNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.duplicateNode(userId, key);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '创建文档节点副本');
    }
  }

  /**
   * 重命名文档节点
   * 
   * 修改指定文档节点的标题。
   * 验证新标题的有效性并更新数据库。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * PUT /api/doc/node/:key/rename
   * {
   *   "title": "新标题"
   * }
   * 
   * @throws {400} 当标题为空时
   * @throws {401} 当用户未认证时
   * @throws {404} 当节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async renameNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '标题不能为空',
          },
        });
      }

      const result = await DocService.renameNode(userId, key, title);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      handleError(error, res, '重命名文档节点');
    }
  }

  /**
   * 移动文档节点位置
   * 
   * 将文档节点移动到新的父节点下，支持指定位置。
   * 更新节点的层级关系和排序位置。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * PUT /api/doc/node/:key/move
   * {
   *   "newParentKey": "new-parent-key",
   *   "position": 0
   * }
   * 
   * @throws {400} 当新父节点键缺失时
   * @throws {401} 当用户未认证时
   * @throws {404} 当节点或新父节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async moveNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;
      const { newParentKey, position } = req.body;

      if (!newParentKey) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '新父节点key不能为空',
          },
        });
      }

      const result = await DocService.moveNode(userId, key, newParentKey, position);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      handleError(error, res, '移动文档节点');
    }
  }

  /**
   * 软删除文档节点
   * 
   * 将文档节点标记为已删除状态，但不从数据库中物理删除。
   * 软删除的节点可以后续恢复。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * DELETE /api/doc/node/:key
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async softDeleteNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.softDeleteNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      handleError(error, res, '软删除文档节点');
    }
  }

  /**
   * 硬删除文档节点
   * 
   * 从数据库中永久删除文档节点及其所有子节点。
   * 此操作不可恢复，请谨慎使用。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * DELETE /api/doc/node/:key/hard
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async hardDeleteNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.hardDeleteNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      handleError(error, res, '硬删除文档节点');
    }
  }

  /**
   * 恢复文档节点
   * 
   * 恢复之前软删除的文档节点。
   * 将节点的删除状态重置为正常状态。
   * 
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @returns {Promise<void>}
   * 
   * @example
   * POST /api/doc/node/:key/restore
   * 
   * @throws {401} 当用户未认证时
   * @throws {404} 当节点不存在时
   * @throws {500} 当服务器内部错误时
   */
  static async restoreNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.restoreNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: unknown) {
      handleError(error, res, '恢复文档节点');
    }
  }
} 