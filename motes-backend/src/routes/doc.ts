import { Router } from 'express';
import { DocController } from '../controllers/docController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 获取文档树
router.get('/tree', authenticateToken, DocController.getDocTree);

// 更新文档树
router.put('/tree', authenticateToken, DocController.updateDocTree);

// 创建文档节点
router.post('/node', authenticateToken, DocController.createNode);

// 创建文档节点副本
router.post('/node/:key/duplicate', authenticateToken, DocController.duplicateNode);

// 重命名文档节点
router.put('/node/:key/rename', authenticateToken, DocController.renameNode);

// 移动文档节点位置
router.put('/node/:key/move', authenticateToken, DocController.moveNode);

// 软删除文档节点
router.put('/node/:key/delete', authenticateToken, DocController.softDeleteNode);

// 硬删除文档节点
router.delete('/node/:key/permanent', authenticateToken, DocController.hardDeleteNode);

// 恢复文档节点
router.put('/node/:key/restore', authenticateToken, DocController.restoreNode);

export default router; 