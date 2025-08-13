/**
 * 大纲转脑图笔记工具文件
 * 
 * 提供将 AI 生成的大纲结构转换为脑图笔记节点的功能，包括：
 * - 大纲节点到脑图笔记节点的映射
 * - 递归构建脑图笔记树结构
 * - ID 生成和父子关系建立
 * 
 */
import { customAlphabet } from 'nanoid';
import type { OutlineNode, OutlineResult } from '../services/llmService.js';
import type { IMoteNode } from '../models/Mote';

// 创建自定义的 nanoid 函数，生成 8 位随机 ID
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * 将大纲节点映射为脑图笔记节点
 * 
 * 递归处理大纲节点，为每个节点生成唯一 ID，建立父子关系，
 * 并限制文本长度以确保数据完整性。
 * 
 * @param {OutlineNode} node - 大纲节点
 * @param {string} parentId - 父节点 ID
 * @returns {IMoteNode} 脑图笔记节点
 * 
 * @example
 * const outlineNode = {
 *   text: '第一章',
 *   children: [{ text: '1.1 节' }]
 * };
 * const moteNode = mapOutlineNodeToMoteNode(outlineNode, 'parent123');
 * 
 * @throws {Error} 当节点数据格式无效时
 */
function mapOutlineNodeToMoteNode(node: OutlineNode, parentId: string): IMoteNode {
  // 为当前节点生成唯一 ID
  const id = nanoid();
  
  // 递归处理子节点
  const children = (node.children || []).map((child) => mapOutlineNodeToMoteNode(child, id));
  
  return {
    id,
    // 限制文本长度为 200 字符，防止数据过长
    text: String(node.text || '').slice(0, 200),
    collapsed: false,
    parentId,
    children,
  };
}

/**
 * 将 AI 生成的大纲转换为脑图笔记结构
 * 
 * 将 AI 服务返回的大纲结果转换为完整的脑图笔记树结构，
 * 包括根节点创建、子节点递归构建和 ID 分配。
 * 
 * @param {OutlineResult} outline - AI 生成的大纲结果
 * @returns {IMoteNode} 完整的脑图笔记根节点
 * 
 * @example
 * const outline = {
 *   title: '项目计划',
 *   nodes: [
 *     { text: '需求分析', children: [{ text: '用户调研' }] },
 *     { text: '设计阶段', children: [{ text: '原型设计' }] }
 *   ]
 * };
 * const moteTree = outlineToMote(outline);
 * 
 * @throws {Error} 当大纲数据格式无效时
 * @throws {Error} 当节点生成失败时
 */
export function outlineToMote(outline: OutlineResult): IMoteNode {
  // 为根节点生成唯一 ID
  const rootId = nanoid();
  
  return {
    id: rootId,
    // 使用大纲标题作为根节点文本，如果没有则使用默认值
    text: outline.title || 'AI 生成',
    collapsed: false,
    parentId: '',
    // 递归处理所有子节点
    children: (outline.nodes || []).map((n) => mapOutlineNodeToMoteNode(n, rootId)),
  };
}


