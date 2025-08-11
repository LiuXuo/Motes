import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// AI 生成脑图笔记
router.post('/generate-mote', authenticateToken, AIController.generateMote);

// AI 生成脑图笔记（文件上传：pdf/docx/md）
router.post('/generate-mote-file', authenticateToken, upload.single('document'), AIController.generateMoteFromFile);

export default router;


