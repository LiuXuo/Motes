/**
 * 脑图笔记路由模块
 * 
 * 定义脑图笔记相关的 API 路由，包括：
 * - 脑图笔记的增删改查
 * - 脑图导入导出功能
 * - 身份验证中间件集成
 * 
 */

import { Router } from 'express';
import { MoteController } from '../controllers/moteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * 获取脑图笔记
 * 
 * 获取指定文档节点对应的脑图笔记内容。
 * 需要身份验证。
 * 
 * @route GET /api/mote/:docKey
 * @param {string} docKey - 文档节点key
 * @returns {Object} 脑图笔记的完整结构
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当脑图笔记不存在时
 */
router.get('/:docKey', authenticateToken, MoteController.getMote);

/**
 * 更新脑图笔记
 * 
 * 更新指定文档节点的脑图笔记内容。
 * 需要身份验证。
 * 
 * @route PUT /api/mote/:docKey
 * @param {string} docKey - 文档节点key
 * @param {Object} moteTree - 新的脑图树结构
 * @returns {Object} 更新结果
 * 
 * @throws {400} 当脑图结构格式错误时
 * @throws {401} 当用户未认证时
 * @throws {404} 当文档节点不存在时
 */
router.put('/:docKey', authenticateToken, MoteController.updateMote);

/**
 * 导出脑图笔记
 * 
 * 将脑图笔记导出为指定格式（如 JSON、Markdown 等）。
 * 需要身份验证。
 * 
 * @route GET /api/mote/:docKey/export
 * @param {string} docKey - 文档节点key
 * @param {string} format - 导出格式 ('json' | 'markdown' | 'txt')
 * @returns {Object} 导出结果，包含文件内容或下载链接
 * 
 * @throws {400} 当导出格式不支持时
 * @throws {401} 当用户未认证时
 * @throws {404} 当脑图笔记不存在时
 */
router.get('/:docKey/export', authenticateToken, MoteController.exportMote);

/**
 * 导入脑图笔记
 * 
 * 从外部文件或数据导入脑图笔记内容。
 * 支持多种格式的导入。
 * 需要身份验证。
 * 
 * @route POST /api/mote/import
 * @param {string} docKey - 目标文档节点key
 * @param {Object} importData - 导入数据或文件
 * @param {string} format - 导入格式 ('json' | 'markdown' | 'txt')
 * @returns {Object} 导入结果
 * 
 * @throws {400} 当导入数据格式错误时
 * @throws {401} 当用户未认证时
 * @throws {404} 当目标文档节点不存在时
 */
router.post('/import', authenticateToken, MoteController.importMote);

export default router; 