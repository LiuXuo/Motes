/**
 * AI 功能路由模块
 * 
 * 定义 AI 相关的 API 路由，包括：
 * - AI 生成脑图笔记
 * - 文件上传和处理
 * - AI 节点扩展功能
 * - 身份验证中间件集成
 * 
 */

import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const router = Router();

/**
 * 文件上传配置
 * 
 * 配置 multer 中间件用于处理文件上传：
 * - 内存存储，最大文件大小 20MB
 * - 支持多种文档格式
 */
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/**
 * AI 生成脑图笔记
 * 
 * 基于文本内容使用 AI 生成脑图笔记结构。
 * 需要身份验证。
 * 
 * @route POST /api/ai/generate-mote
 * @param {string} content - 要生成脑图的文本内容
 * @param {string} title - 脑图标题
 * @param {Object} options - 生成选项（如节点数量、层级深度等）
 * @returns {Object} 生成的脑图笔记结构
 * 
 * @throws {400} 当内容为空或格式错误时
 * @throws {401} 当用户未认证时
 * @throws {500} 当 AI 服务调用失败时
 */
router.post('/generate-mote', authenticateToken, AIController.generateMote);

/**
 * AI 生成脑图笔记（文件上传）
 * 
 * 上传文档文件（PDF/DOCX/MD）并使用 AI 生成脑图笔记。
 * 支持多种文档格式的自动解析和处理。
 * 需要身份验证。
 * 
 * @route POST /api/ai/generate-mote-file
 * @param {File} document - 上传的文档文件
 * @param {string} title - 脑图标题（可选，默认使用文件名）
 * @param {Object} options - 生成选项
 * @returns {Object} 生成的脑图笔记结构
 * 
 * @throws {400} 当文件格式不支持或文件损坏时
 * @throws {401} 当用户未认证时
 * @throws {413} 当文件大小超过限制时
 * @throws {500} 当文件解析或 AI 服务调用失败时
 */
router.post('/generate-mote-file', authenticateToken, upload.single('document'), AIController.generateMoteFromFile);

/**
 * AI 节点扩展（AI生枝）
 * 
 * 基于现有节点内容使用 AI 生成子节点。
 * 用于扩展和丰富脑图结构。
 * 需要身份验证。
 * 
 * @route POST /api/ai/expand-node
 * @param {string} nodeText - 当前节点文本内容
 * @param {string} context - 上下文信息（可选）
 * @param {Object} options - 扩展选项（如子节点数量、扩展方向等）
 * @returns {Object} 生成的子节点列表
 * 
 * @throws {400} 当节点内容为空时
 * @throws {401} 当用户未认证时
 * @throws {500} 当 AI 服务调用失败时
 */
router.post('/expand-node', authenticateToken, AIController.expandNode);

export default router;


