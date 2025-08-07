import { Request, Response } from 'express';
import { MoteService } from '../services/moteService';

export class MoteController {
  // 获取脑图笔记
  static async getMote(req: Request, res: Response) {
    try {
      const { docKey } = req.params;
      const userId = req.user!.userId;
      
      const result = await MoteService.getMote(docKey, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('获取脑图笔记错误:', error);
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
          details: error instanceof Error ? error.message : '未知错误',
        },
      });
    }
  }

  // 更新脑图笔记
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
    } catch (error: any) {
      console.error('更新脑图笔记错误:', error);
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

  // 导出脑图笔记
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
    } catch (error: any) {
      console.error('导出脑图笔记错误:', error);
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

  // 导入脑图笔记
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
            details: '父节点key不能为空',
          },
        });
      }

      const result = await MoteService.importMote(parentKey, moteTree, markdownContent, title, format, userId);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('导入脑图笔记错误:', error);
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