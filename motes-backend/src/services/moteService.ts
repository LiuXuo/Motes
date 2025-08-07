import { Mote } from '../models/Mote';
import { Doc } from '../models/Doc';
import { generateId } from '../utils/idGenerator';

export class MoteService {
  // 公共函数：在文档树中查找节点标题
  private static findNodeTitle(node: any, targetKey: string): string | null {
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

  // 获取脑图笔记
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

  // 更新脑图笔记
  static async updateMote(docKey: string, moteTree: any, userId: string) {
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

  // 导出脑图笔记
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

  // 导入脑图笔记
  static async importMote(parentKey: string, moteTree: any, markdownContent: string, title: string, format: string, userId: string) {
    let processedTree: any;

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
            details: '脑图树数据不能为空',
          },
        };
      }
      // 重新构建树结构，添加id、parentId和collapsed字段
      processedTree = this.processImportedTree(moteTree);
    }

    // 生成新的文档节点
    const newNodeKey = generateId();
    const newNode = {
      key: newNodeKey,
      title,
      type: 'mote',
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
    const addNodeToTree = (node: any, parentKey: string): boolean => {
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

    await doc.save();

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

  // 辅助函数：转换为Markdown（只使用-无序列表表示层级缩进）
  private static convertToMarkdown(moteTree: any, level = 1): string {
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

  // 辅助函数：清理脑图树，只保留text和children字段
  private static cleanMoteTree(node: any): any {
    const cleanNode: any = {
      text: node.text,
    };
    
    if (node.children && node.children.length > 0) {
      cleanNode.children = node.children.map((child: any) => this.cleanMoteTree(child));
    }
    
    return cleanNode;
  }

  // 辅助函数：处理导入的树结构，添加id、parentId和collapsed字段
  private static processImportedTree(node: any, parentId = ''): any {
    const id = generateId();
    const processedNode: any = {
      id,
      text: node.text,
      collapsed: false,
      parentId: parentId || id, // 如果是根节点，parentId设为自己的id
      children: [],
    };
    
    if (node.children && node.children.length > 0) {
      processedNode.children = node.children.map((child: any) => this.processImportedTree(child, id));
    }
    
    return processedNode;
  }

  // 辅助函数：将markdown内容解析为树结构
  private static parseMarkdownToTree(content: string): any {
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
    let rootNode: any = null;
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
    const stack: Array<{ node: any, level: number, type: 'list' }> = [
      { node: rootNode, level: 1, type: 'list' },
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
          parentId: stack[stack.length - 1].node.id,
          children: [],
        };
        
        stack[stack.length - 1].node.children.push(newNode);
        stack.push({ node: newNode, level, type: 'list' });
        continue;
      }

      // 普通文本行，作为最近节点的子节点
      if (stack.length > 0) {
        const newNode = {
          id: generateId(),
          text: trimmedLine,
          collapsed: false,
          parentId: stack[stack.length - 1].node.id,
          children: [],
        };
        stack[stack.length - 1].node.children.push(newNode);
      }
    }

    return rootNode;
  }
} 