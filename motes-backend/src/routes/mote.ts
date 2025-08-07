import { Router } from 'express';
import { MoteController } from '../controllers/moteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 获取脑图笔记
router.get('/:docKey', authenticateToken, MoteController.getMote);

// 更新脑图笔记
router.put('/:docKey', authenticateToken, MoteController.updateMote);

// 导出脑图笔记
router.get('/:docKey/export', authenticateToken, MoteController.exportMote);

// 导入脑图笔记
router.post('/import', authenticateToken, MoteController.importMote);

export default router; 