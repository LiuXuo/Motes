/**
 * 文档路由模块
 * 
 * 定义文档树相关的 API 路由，包括：
 * - 文档树的增删改查
 * - 节点操作（创建、重命名、移动、删除）
 * - 软删除和恢复功能
 * - 身份验证中间件集成
 * 
 */

import { Router } from 'express';
import { DocController } from '../controllers/docController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * 获取文档树
 * 
 * 获取当前用户的完整文档树结构。
 * 需要身份验证。
 * 
 * @route GET /api/doc/tree
 * @returns {Object} 用户的文档树结构
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当文档树不存在时
 */
router.get('/tree', authenticateToken, DocController.getDocTree);

/**
 * 更新文档树
 * 
 * 更新用户的完整文档树结构。
 * 需要身份验证。
 * 
 * @route PUT /api/doc/tree
 * @param {Object} docTree - 新的文档树结构
 * @returns {Object} 更新结果
 * 
 * @throws {400} 当文档树格式错误时
 * @throws {401} 当用户未认证时
 */
router.put('/tree', authenticateToken, DocController.updateDocTree);

/**
 * 创建文档节点
 * 
 * 在指定父节点下创建新的文档节点。
 * 支持文件夹和思维导图两种类型。
 * 需要身份验证。
 * 
 * @route POST /api/doc/node
 * @param {string} title - 节点标题
 * @param {string} type - 节点类型 ('folder' | 'mote')
 * @param {string} parentKey - 父节点key
 * @returns {Object} 新创建的节点信息
 * 
 * @throws {400} 当参数缺失或格式错误时
 * @throws {401} 当用户未认证时
 * @throws {404} 当父节点不存在时
 */
router.post('/node', authenticateToken, DocController.createNode);

/**
 * 创建文档节点副本
 * 
 * 复制指定节点及其子节点结构。
 * 需要身份验证。
 * 
 * @route POST /api/doc/node/:key/duplicate
 * @param {string} key - 要复制的节点key
 * @returns {Object} 复制结果
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点不存在时
 */
router.post('/node/:key/duplicate', authenticateToken, DocController.duplicateNode);

/**
 * 重命名文档节点
 * 
 * 修改指定节点的标题。
 * 需要身份验证。
 * 
 * @route PUT /api/doc/node/:key/rename
 * @param {string} key - 节点key
 * @param {string} title - 新的节点标题
 * @returns {Object} 重命名结果
 * 
 * @throws {400} 当标题为空时
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点不存在时
 */
router.put('/node/:key/rename', authenticateToken, DocController.renameNode);

/**
 * 移动文档节点位置
 * 
 * 将节点移动到新的父节点下。
 * 需要身份验证。
 * 
 * @route PUT /api/doc/node/:key/move
 * @param {string} key - 要移动的节点key
 * @param {string} newParentKey - 新的父节点key
 * @returns {Object} 移动结果
 * 
 * @throws {400} 当目标位置无效时
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点或父节点不存在时
 */
router.put('/node/:key/move', authenticateToken, DocController.moveNode);

/**
 * 软删除文档节点
 * 
 * 将节点标记为已删除，但不从数据库中移除。
 * 需要身份验证。
 * 
 * @route PUT /api/doc/node/:key/delete
 * @param {string} key - 要删除的节点key
 * @returns {Object} 删除结果
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点不存在时
 */
router.put('/node/:key/delete', authenticateToken, DocController.softDeleteNode);

/**
 * 硬删除文档节点
 * 
 * 从数据库中永久删除节点及其子节点。
 * 需要身份验证。
 * 
 * @route DELETE /api/doc/node/:key/permanent
 * @param {string} key - 要删除的节点key
 * @returns {Object} 删除结果
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点不存在时
 */
router.delete('/node/:key/permanent', authenticateToken, DocController.hardDeleteNode);

/**
 * 恢复文档节点
 * 
 * 恢复已软删除的节点。
 * 需要身份验证。
 * 
 * @route PUT /api/doc/node/:key/restore
 * @param {string} key - 要恢复的节点key
 * @returns {Object} 恢复结果
 * 
 * @throws {401} 当用户未认证时
 * @throws {404} 当节点不存在时
 */
router.put('/node/:key/restore', authenticateToken, DocController.restoreNode);

export default router; 