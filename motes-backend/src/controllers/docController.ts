import { Request, Response } from 'express';
import { DocService } from '../services/docService';

export class DocController {
  // 获取文档树
  static async getDocTree(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const result = await DocService.getDocTree(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('获取文档树错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 更新文档树
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
    } catch (error: any) {
      console.error('更新文档树错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 创建文档节点
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
    } catch (error: any) {
      console.error('创建文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 创建文档节点副本
  static async duplicateNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.duplicateNode(userId, key);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('创建文档节点副本错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 重命名文档节点
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
    } catch (error: any) {
      console.error('重命名文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 移动文档节点位置
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
    } catch (error: any) {
      console.error('移动文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 软删除文档节点
  static async softDeleteNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.softDeleteNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('软删除文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 硬删除文档节点
  static async hardDeleteNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.hardDeleteNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('硬删除文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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

  // 恢复文档节点
  static async restoreNode(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { key } = req.params;

      const result = await DocService.restoreNode(userId, key);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('恢复文档节点错误:', error);
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.error,
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
} 