/**
 * 脑图笔记服务类
 * 
 * 负责脑图笔记的管理，包括：
 * - 脑图笔记的创建和更新
 * - 脑图笔记树的导入导出
 * - Markdown 格式转换
 * - 与文档树的关联
 * 
 */

import { Mote } from '../models/Mote';
import { Doc } from '../models/Doc';
import { generateId } from '../utils/idGenerator';
import type { DocTreeNode, MoteTreeNode, CleanMoteTreeNode } from '../types/common';

/**
 * 脑图笔记服务类
 * 
 * 负责脑图笔记的管理，包括：
 * - 脑图笔记的创建和更新
 * - 脑图笔记树的导入导出
 * - Markdown 格式转换
 * - 与文档树的关联
 * 
 * @class MoteService
 */
export class MoteService {
  /**
   * 在文档树中查找节点标题
   * 
   * 递归查找指定key的节点标题，用于获取脑图笔记的标题。
   * 
   * @param {DocTreeNode} node - 文档树节点
   * @param {string} targetKey - 目标节点key
   * @returns {string | null} 节点标题，如果未找到则返回null
   * 
   * @private
   */
  private static findNodeTitle(node: DocTreeNode, targetKey: string): string | null {
    if (node.key === targetKey) {
      return node.title;
    }
    if (node.children) {
      for (const child of node.children) {
        const result = this.findNodeTitle(child, targetKey);
        if (result) return result;
      }
    }
    return null;
  }

  /**
   * 获取脑图笔记
   * 
   * 获取指定文档的脑图笔记，如果不存在且文档在文档树中存在则创建默认笔记。
   * 
   * @param {string} docKey - 文档key
   * @param {string} userId - 用户ID
   * @returns {Promise<{docKey: string, moteTree: MoteTreeNode}>} 脑图笔记数据
   * 
   * @throws {404} 当脑图笔记不存在且文档不在文档树中时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await MoteService.getMote('docKey123', 'user123');
   * console.log(result.moteTree);
   */
  static async getMote(docKey: string, userId: string) {
    let mote = await Mote.findOne({ docId: docKey });
    
    if (!mote) {
      // 获取文档树以查找对应的title
      const doc = await Doc.findOne({ userId });
      let nodeTitle = '新脑图笔记';
      let nodeExists = false;
      
      if (doc) {
        const title = this.findNodeTitle(doc.docTree, docKey);
        if (title) {
          nodeTitle = title;
          nodeExists = true;
        }
      }
      
      // 只有当该docKey在文档树中存在时，才创建新的脑图笔记
      if (nodeExists) {
        // 如果笔记不存在，创建一个默认的
        mote = new Mote({
          docId: docKey,
          moteTree: {
            id: docKey,
            text: nodeTitle,
            collapsed: false,
            parentId: docKey,
            children: [],
          },
        });
        await mote.save();
      } else {
        // 如果docKey在文档树中不存在，返回404错误
        throw {
          status: 404,
          error: {
            code: 'NOT_FOUND',
            message: '脑图笔记不存在',
            details: '该文档在文档树中不存在',
          },
        };
      }
    }

    return {
      docKey,
      moteTree: mote.moteTree,
    };
  }

  /**
   * 更新脑图笔记
   * 
   * 更新指定文档的脑图笔记，如果不存在且文档在文档树中存在则创建新笔记。
   * 
   * @param {string} docKey - 文档key
   * @param {MoteTreeNode} moteTree - 新的脑图笔记树结构
   * @param {string} userId - 用户ID
   * @returns {Promise<{message: string}>} 更新结果
   * 
   * @throws {404} 当脑图笔记不存在且文档不在文档树中时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await MoteService.updateMote('docKey123', newMoteTree, 'user123');
   */
  static async updateMote(docKey: string, moteTree: MoteTreeNode, userId: string) {
    let mote = await Mote.findOne({ docId: docKey });
    
    if (!mote) {
      // 检查该docKey是否在文档树中存在
      const doc = await Doc.findOne({ userId });
      let nodeExists = false;
      
      if (doc) {
        const title = this.findNodeTitle(doc.docTree, docKey);
        if (title) {
          nodeExists = true;
        }
      }
      
      if (!nodeExists) {
        throw {
          status: 404,
          error: {
            code: 'NOT_FOUND',
            message: '脑图笔记不存在',
            details: '该文档在文档树中不存在',
          },
        };
      }
      
      // 只有在文档树中存在时才创建新的脑图笔记
      mote = new Mote({
        docId: docKey,
        moteTree,
      });
    } else {
      mote.moteTree = moteTree;
    }

    await mote.save();
    return { message: '笔记更新成功' };
  }

  /**
   * 导出脑图笔记
   * 
   * 将脑图笔记导出为指定格式（JSON 或 Markdown）。
   * 支持数据清理和格式转换。
   * 
   * @param {string} docKey - 文档key
   * @param {string} format - 导出格式 ('json' | 'markdown')
   * @param {string} userId - 用户ID
   * @returns {Promise<{filename: string, content: string, size: number}>} 导出结果
   * 
   * @throws {400} 当导出格式不支持时
   * @throws {404} 当笔记不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await MoteService.exportMote('docKey123', 'markdown', 'user123');
   * console.log(result.filename); // 输出文件名
   */
  static async exportMote(docKey: string, format: string, userId: string) {
    // 获取笔记数据
    const mote = await Mote.findOne({ docId: docKey });
    if (!mote) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '笔记不存在',
        },
      };
    }

    // 获取文档节点信息用于文件名
    const doc = await Doc.findOne({ userId });
    let nodeTitle = '笔记';
    
    if (doc) {
      const title = this.findNodeTitle(doc.docTree, docKey);
      if (title) {
        nodeTitle = title;
      }
    }

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
    case 'json':
      // 清理数据，只保留text和children字段
      content = JSON.stringify(this.cleanMoteTree(mote.moteTree), null, 2);
      mimeType = 'application/json; charset=utf-8';
      filename = `${nodeTitle}.json`;
      break;
      
    case 'markdown':
      // 清理数据，只保留text字段，根据层级生成markdown
      content = this.convertToMarkdown(this.cleanMoteTree(mote.moteTree));
      mimeType = 'text/markdown; charset=utf-8';
      filename = `${nodeTitle}.md`;
      break;
      
    default:
      throw {
        status: 400,
        error: {
          code: 'VALIDATION_ERROR',
          message: '数据验证失败',
          details: '不支持的导出格式',
        },
      };
    }

    // 转换为base64
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    return {
      filename,
      content: dataUrl,
      size: content.length,
    };
  }

  /**
   * 导入脑图笔记
   * 
   * 导入脑图笔记到指定父节点下，支持 JSON 和 Markdown 格式。
   * 会自动创建新的文档节点和对应的脑图笔记。
   * 
   * @param {string} parentKey - 父节点key
   * @param {MoteTreeNode} moteTree - 脑图笔记树数据（JSON格式时使用）
   * @param {string} markdownContent - Markdown内容（Markdown格式时使用）
   * @param {string} title - 新节点标题
   * @param {string} format - 导入格式 ('json' | 'markdown')
   * @param {string} userId - 用户ID
   * @returns {Promise<{newNode: DocTreeNode, message: string}>} 导入结果
   * 
   * @throws {400} 当格式参数无效或内容为空时
   * @throws {404} 当文档树或父节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await MoteService.importMote('parentKey', null, '# 标题\n- 内容', '新笔记', 'markdown', 'user123');
   */
  static async importMote(parentKey: string, moteTree: MoteTreeNode, markdownContent: string, title: string, format: string, userId: string) {
    let processedTree: MoteTreeNode;

    if (format === 'markdown') {
      if (!markdownContent) {
        throw {
          status: 400,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: 'Markdown内容不能为空',
          },
        };
      }
      processedTree = this.parseMarkdownToTree(markdownContent);
    } else {
      if (!moteTree) {
        throw {
          status: 400,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: '脑图笔记树数据不能为空',
          },
        };
      }
      // 重新构建树结构，添加id、parentId和collapsed字段
      processedTree = this.processImportedTree(moteTree as unknown as Record<string, unknown>);
    }

    // 生成新的文档节点
    const newNodeKey = generateId();
    const newNode: DocTreeNode = {
      key: newNodeKey,
      title,
      type: 'mote' as const,
      isDeleted: false,
    };

    // 添加到文档树
    const doc = await Doc.findOne({ userId });
    if (!doc) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '文档树不存在',
        },
      };
    }

    // 递归查找并添加节点
    const addNodeToTree = (node: DocTreeNode, parentKey: string): boolean => {
      if (node.key === parentKey) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(newNode);
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (addNodeToTree(child, parentKey)) {
            return true;
          }
        }
      }
      
      return false;
    };

    const success = addNodeToTree(doc.docTree, parentKey);
    if (!success) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '父节点不存在',
        },
      };
    }

    // 使用原子操作更新文档，避免深层修改未被 Mongoose 变更跟踪到
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('导入笔记更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '导入笔记更新失败',
        },
      };
    }

    // 创建脑图笔记
    const mote = new Mote({
      docId: newNodeKey,
      moteTree: processedTree,
    });
    await mote.save();

    return {
      newNode,
      message: '笔记导入成功',
    };
  }

  /**
   * 转换为Markdown格式
   * 
   * 将脑图笔记树结构转换为Markdown格式，使用无序列表表示层级关系。
   * 
   * @param {CleanMoteTreeNode} moteTree - 清理后的脑图笔记树
   * @param {number} [level=1] - 当前层级
   * @returns {string} Markdown格式的文本
   * 
   * @private
   * 
   * @example
   * const markdown = MoteService.convertToMarkdown(cleanTree);
   * // 输出: "- 根节点\n    - 子节点1\n    - 子节点2"
   */
  private static convertToMarkdown(moteTree: CleanMoteTreeNode, level = 1): string {
    let markdown = '';
    
    // 输出当前节点，使用无序列表
    const indent = '    '.repeat(level - 1); // 每层增加四个空格缩进
    markdown += `${indent}- ${moteTree.text}\n`;
    
    // 处理子节点
    if (moteTree.children && moteTree.children.length > 0) {
      for (const child of moteTree.children) {
        markdown += this.convertToMarkdown(child, level + 1);
      }
    }
    
    return markdown;
  }

  /**
   * 清理脑图笔记树数据
   * 
   * 清理脑图笔记树，只保留text和children字段，移除其他系统字段。
   * 
   * @param {MoteTreeNode} node - 原始脑图笔记树节点
   * @returns {CleanMoteTreeNode} 清理后的节点
   * 
   * @private
   * 
   * @example
   * const cleanNode = MoteService.cleanMoteTree(originalNode);
   */
  private static cleanMoteTree(node: MoteTreeNode): CleanMoteTreeNode {
    const cleanNode: CleanMoteTreeNode = {
      text: node.text,
    };
    
    if (node.children && node.children.length > 0) {
      cleanNode.children = node.children.map((child: MoteTreeNode) => this.cleanMoteTree(child));
    }
    
    return cleanNode;
  }

  /**
   * 处理导入的树结构
   * 
   * 为导入的树结构添加id、parentId和collapsed字段，确保数据结构完整性。
   * 
   * @param {Record<string, unknown>} node - 导入的节点数据
   * @param {string} [parentId=''] - 父节点ID
   * @returns {MoteTreeNode} 处理后的节点
   * 
   * @private
   * 
   * @example
   * const processedNode = MoteService.processImportedTree(importedData);
   */
  private static processImportedTree(node: Record<string, unknown>, parentId = ''): MoteTreeNode {
    const id = generateId();
    const processedNode: MoteTreeNode = {
      id,
      text: String(node.text || ''),
      collapsed: false,
      parentId: parentId || id, // 如果是根节点，parentId设为自己的id
      children: [],
    };
    
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      processedNode.children = node.children.map((child: Record<string, unknown>) => this.processImportedTree(child, id));
    }
    
    return processedNode;
  }

  /**
   * 将Markdown内容解析为树结构
   * 
   * 解析Markdown内容，识别列表项和缩进层级，构建脑图笔记树结构。
   * 支持多种缩进格式和列表符号。
   * 
   * @param {string} content - Markdown内容
   * @returns {MoteTreeNode} 解析后的脑图笔记树
   * 
   * @private
   * 
   * @example
   * const tree = MoteService.parseMarkdownToTree('# 标题\n- 项目1\n  - 子项目1');
   */
  private static parseMarkdownToTree(content: string): MoteTreeNode {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      // 空内容，返回默认根节点
      const rootId = generateId();
      return {
        id: rootId,
        text: '导入的笔记',
        collapsed: false,
        parentId: rootId,
        children: [],
      };
    }

    // 第一步：分析缩进格式
    let indentSize = 4; // 默认4空格
    // let hasListItems = false;
    // 查找列表项并分析缩进格式
    for (const line of lines) {
      const listMatch = line.match(/^(\s*)[-+*]\s+(.+)$/);
      if (listMatch) {
        // hasListItems = true;
        const indent = listMatch[1].length;
        if (indent > 0) {
          // 找到第一个非零缩进，确定缩进大小
          if (indent % 2 === 0) {
            indentSize = 2;
          } else if (indent % 4 === 0) {
            indentSize = 4;
          } else {
            // 如果既不是2的倍数也不是4的倍数，尝试推断
            indentSize = indent <= 2 ? 2 : 4;
          }
          break;
        }
      }
    }

    // 第二步：确定根节点
    let rootNode: MoteTreeNode | null = null;
    let startIndex = 0;
    // 查找第一个无序列表项作为根节点
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^(\s*)[-+*]\s+(.+)$/);
      
      if (listMatch) {
        // const indent = listMatch[1].length;
        const text = listMatch[2].trim();
        
        const rootId = generateId();
        rootNode = {
          id: rootId,
          text,
          collapsed: false,
          parentId: rootId,
          children: [],
        };
        startIndex = i + 1;
        break;
      }
    }
    // 如果没有找到列表项，使用第一行作为根节点
    if (!rootNode) {
      const rootId = generateId();
      rootNode = {
        id: rootId,
        text: lines[0].trim(),
        collapsed: false,
        parentId: rootId,
        children: [],
      };
      startIndex = 1;
    }

    // 第三步：解析剩余内容
    const stack: Array<{ node: MoteTreeNode, level: number, type: 'list' }> = [
      { node: rootNode!, level: 1, type: 'list' },
    ];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') continue;

      // 检查无序列表行（支持-、+、*符号）
      const listMatch = line.match(/^(\s*)[-+*]\s+(.+)$/);
      if (listMatch) {
        const indent = listMatch[1].length;
        const text = listMatch[2].trim();
        
        // 根据检测到的缩进大小计算层级
        const level = Math.floor(indent / indentSize) + 1;
        
        // 回退栈到合适的层级
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        
        // 创建新节点
        const newNode = {
          id: generateId(),
          text,
          collapsed: false,
          parentId: stack[stack.length - 1]!.node.id,
          children: [],
        };
        
        const currentStack = stack[stack.length - 1];
        if (currentStack && currentStack.node.children) {
          currentStack.node.children.push(newNode);
          stack.push({ node: newNode, level, type: 'list' });
        }
        continue;
      }

      // 普通文本行，作为最近节点的子节点
      if (stack.length > 0) {
        const currentStack = stack[stack.length - 1];
        if (currentStack && currentStack.node.children) {
          const newNode = {
            id: generateId(),
            text: trimmedLine,
            collapsed: false,
            parentId: currentStack.node.id,
            children: [],
          };
          currentStack.node.children.push(newNode);
        }
      }
    }

    return rootNode;
  }
} 