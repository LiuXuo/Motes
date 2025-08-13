/**
 * 文档服务类
 * 
 * 负责文档树的管理，包括：
 * - 文档树的创建和更新
 * - 节点的增删改查
 * - 文档导入导出
 * - 与脑图笔记的关联
 * 
 */

import { Doc, IDocNode } from '../models/Doc';
import { Mote } from '../models/Mote';
import { generateId } from '../utils/idGenerator';
import { generateDefaultDocTree, defaultMotes } from '../config/defaultData';
import type { DocTreeNode } from '../types/common';

/**
 * 文档服务类
 * 
 * 负责文档树的管理，包括：
 * - 文档树的创建和更新
 * - 节点的增删改查
 * - 文档导入导出
 * - 与脑图笔记的关联
 * 
 * @class DocService
 */
export class DocService {
  /**
   * 获取文档树
   * 
   * 获取用户的文档树结构，如果用户没有文档树则创建默认的引导文档树。
   * 创建默认文档树时会同时创建对应的默认 mote 记录。
   * 
   * @param {string} userId - 用户ID
   * @returns {Promise<{docTree: DocTreeNode}>} 文档树结构
   * 
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await DocService.getDocTree('user123');
   * console.log(result.docTree);
   */
  static async getDocTree(userId: string) {
    let doc = await Doc.findOne({ userId });
    
    if (!doc) {
      // 如果用户没有文档树，创建一个默认的引导文档树
      const defaultDocTree = generateDefaultDocTree(userId);
      
      doc = new Doc({
        userId,
        docTree: defaultDocTree,
      });
      await doc.save();
      
      // 创建对应的默认mote（并行执行，不等待完成）
      Object.values(defaultMotes).forEach(moteData => {
        Mote.create(moteData).catch(error => {
          console.error('创建默认mote时出错:', error);
          // 即使mote创建失败，也不影响文档树的创建
        });
      });
    }

    return {
      docTree: doc.docTree,
    };
  }

  /**
   * 更新文档树
   * 
   * 更新用户的文档树结构，如果文档树不存在则创建新的。
   * 
   * @param {string} userId - 用户ID
   * @param {DocTreeNode} docTree - 新的文档树结构
   * @returns {Promise<{message: string}>} 更新结果
   * 
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await DocService.updateDocTree('user123', newDocTree);
   */
  static async updateDocTree(userId: string, docTree: DocTreeNode) {
    let doc = await Doc.findOne({ userId });
    
    if (!doc) {
      doc = new Doc({
        userId,
        docTree,
      });
    } else {
      doc.docTree = docTree;
    }

    await doc.save();
    return { message: '文档树更新成功' };
  }

  /**
   * 创建文档节点
   * 
   * 在指定父节点下创建新的文档节点，支持文件夹和脑图笔记两种类型。
   * 创建脑图笔记节点时会同时创建对应的 mote 记录。
   * 
   * @param {string} userId - 用户ID
   * @param {string} title - 节点标题
   * @param {string} type - 节点类型 ('folder' | 'mote')
   * @param {string} parentKey - 父节点key
   * @returns {Promise<{newNode: DocTreeNode, message: string}>} 新创建的节点和结果消息
   * 
   * @throws {400} 当节点类型无效时
   * @throws {404} 当文档树不存在时
   * @throws {404} 当父节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await DocService.createNode('user123', '新文件夹', 'folder', 'parentKey');
   */
  static async createNode(userId: string, title: string, type: string, parentKey: string) {
    // 验证类型
    if (!['folder', 'mote'].includes(type)) {
      throw {
        status: 400,
        error: {
          code: 'VALIDATION_ERROR',
          message: '数据验证失败',
          details: '类型必须是folder或mote',
        },
      };
    }

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

    // 生成新节点key
    const newNodeKey = generateId();
    const newNode: DocTreeNode = {
      key: newNodeKey,
      title,
      type: type as 'folder' | 'mote',
      isDeleted: false,
      children: type === 'folder' ? [] : undefined,
    };

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
    
    try {
      // 使用原子操作更新文档
      const updateResult = await Doc.updateOne(
        { userId: doc.userId },
        { $set: { docTree: doc.docTree } },
      );
      
      if (updateResult.modifiedCount === 0) {
        console.error('文档更新失败，没有修改任何记录');
        throw {
          status: 500,
          error: {
            code: 'UPDATE_ERROR',
            message: '文档更新失败',
          },
        };
      }    
    } catch (saveError) {
      console.error('保存文档时出错:', saveError);
      throw {
        status: 500,
        error: {
          code: 'SAVE_ERROR',
          message: '保存文档失败',
        },
      };
    }

    return {
      newNode,
      message: '文档节点创建成功',
    };
  }

  /**
   * 创建文档节点副本
   * 
   * 复制指定节点及其所有子节点，重新生成所有ID。
   * 如果复制的节点是mote类型，会同时复制对应的moteTree。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 要复制的节点key
   * @returns {Promise<{duplicatedNode: DocTreeNode, message: string}>} 复制的节点和结果消息
   * 
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await DocService.duplicateNode('user123', 'nodeKey');
   */
  static async duplicateNode(userId: string, key: string) {
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

    // 递归查找节点并创建副本
    let targetNode: IDocNode | null = null;
    let parentNode: IDocNode | null = null;

    const findNodeAndParent = (node: IDocNode, targetKey: string): boolean => {
      if (node.children) {
        const index = node.children.findIndex((child: IDocNode) => child.key === targetKey);
        if (index !== -1) {
          targetNode = node.children[index];
          parentNode = node;
          return true;
        }
        
        for (const child of node.children) {
          if (findNodeAndParent(child, targetKey)) {
            return true;
          }
        }
      }
      return false;
    };

    const found = findNodeAndParent(doc.docTree, key);
    if (!found || !targetNode) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '节点不存在',
        },
      };
    }

    // 递归复制节点及其子节点，重新生成所有ID
    const duplicateNode = (node: IDocNode): IDocNode => {
      const newNode: IDocNode = {
        key: generateId(),
        title: node.title + ' (副本)',
        type: node.type,
        isDeleted: false,
      };

      if (node.children && node.children.length > 0) {
        newNode.children = node.children.map((child: IDocNode) => duplicateNode(child));
      }

      return newNode;
    };

    const duplicatedNode = duplicateNode(targetNode as IDocNode);

    // 将副本插入到原节点下方
    if (parentNode && (parentNode as IDocNode).children) {
      const insertIndex = (parentNode as IDocNode).children!.findIndex((child: IDocNode) => child.key === key) + 1;
      (parentNode as IDocNode).children!.splice(insertIndex, 0, duplicatedNode);
    }

    // 如果复制的节点是mote类型，需要同时复制对应的moteTree
    if (targetNode && (targetNode as IDocNode).type === 'mote') {
      try {
        // 查找原mote的moteTree
        const originalMote = await Mote.findOne({ docId: key });
        if (originalMote) {
          // 递归复制moteTree，根节点ID和parentId都使用docKey，其他节点保持原ID
          const duplicateMoteTree = (node: Record<string, unknown>, isRoot = true): Record<string, unknown> => {
            const newNode: Record<string, unknown> = {
              id: isRoot ? duplicatedNode.key : node.id, // 根节点ID使用docKey
              text: node.text,
              collapsed: node.collapsed,
              parentId: isRoot ? duplicatedNode.key : node.parentId, // 根节点的parentId也使用docKey
            };

            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
              newNode.children = node.children.map((child: Record<string, unknown>) => duplicateMoteTree(child, false));
            }

            return newNode;
          };

          const duplicatedMoteTree = duplicateMoteTree(originalMote.moteTree as unknown as Record<string, unknown>);

          // 创建新的Mote记录
          await Mote.create({
            docId: duplicatedNode.key,
            moteTree: duplicatedMoteTree,
          });
        }
      } catch (moteError) {
        console.error('复制moteTree时出错:', moteError);
        // 即使moteTree复制失败，也不影响文档节点的复制
      }
    }

    // 使用原子操作更新文档
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('创建副本更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '创建副本更新失败',
        },
      };
    }

    return {
      duplicatedNode,
      message: '文档节点副本创建成功',
    };
  }

  /**
   * 重命名文档节点
   * 
   * 修改指定节点的标题。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 节点key
   * @param {string} title - 新的节点标题
   * @returns {Promise<{updatedNode: DocTreeNode, message: string}>} 更新后的节点和结果消息
   * 
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * const result = await DocService.renameNode('user123', 'nodeKey', '新标题');
   */
  static async renameNode(userId: string, key: string, title: string) {
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

    // 递归查找并重命名节点
    const renameNodeInTree = (node: IDocNode, targetKey: string): boolean => {
      if (node.key === targetKey) {
        node.title = title;
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (renameNodeInTree(child, targetKey)) {
            return true;
          }
        }
      }
      
      return false;
    };

    const success = renameNodeInTree(doc.docTree, key);
    if (!success) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '节点不存在',
        },
      };
    }

    await Doc.updateOne({ _id: doc._id }, { docTree: doc.docTree });

    return {
      updatedNode: {
        key,
        title,
        type: 'folder', // 这里需要从实际节点获取类型
        isDeleted: false,
      },
      message: '文档节点重命名成功',
    };
  }

  /**
   * 移动文档节点位置
   * 
   * 将指定节点移动到新的父节点下，可以指定插入位置。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 要移动的节点key
   * @param {string} newParentKey - 新的父节点key
   * @param {number} [position] - 插入位置，可选
   * @returns {Promise<{message: string}>} 移动结果
   * 
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {404} 当目标父节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await DocService.moveNode('user123', 'nodeKey', 'newParentKey', 0);
   */
  static async moveNode(userId: string, key: string, newParentKey: string, position?: number) {
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

    // 递归查找并移动节点
    let targetNode: IDocNode | null = null;
    let sourceParent: IDocNode | null = null;

    const findAndRemoveNode = (node: IDocNode, targetKey: string): boolean => {
      if (node.children) {
        const index = node.children.findIndex((child: IDocNode) => child.key === targetKey);
        if (index !== -1) {
          targetNode = node.children[index];
          node.children.splice(index, 1);
          sourceParent = node;
          return true;
        }
        
        for (const child of node.children) {
          if (findAndRemoveNode(child, targetKey)) {
            return true;
          }
        }
      }
      return false;
    };

    const found = findAndRemoveNode(doc.docTree, key);
    if (!found || !targetNode) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '节点不存在',
        },
      };
    }

    // 添加到新位置
    const addToNewParent = (node: IDocNode, parentKey: string): boolean => {
      if (node.key === parentKey) {
        if (!node.children) {
          node.children = [];
        }
        
        const insertPosition = position !== undefined ? Math.min(position, node.children.length) : node.children.length;
        node.children.splice(insertPosition, 0, targetNode!);
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (addToNewParent(child, parentKey)) {
            return true;
          }
        }
      }
      
      return false;
    };

    const added = addToNewParent(doc.docTree, newParentKey);
    if (!added) {
      // 如果添加失败，恢复原位置
      if (sourceParent && targetNode) {
        if (!(sourceParent as IDocNode).children) {
          (sourceParent as IDocNode).children = [];
        }
        (sourceParent as IDocNode).children!.push(targetNode);
      }
      
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '目标父节点不存在',
        },
      };
    }

    // 使用原子操作更新文档，避免深层修改未被 Mongoose 变更跟踪到
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    if (updateResult.modifiedCount === 0) {
      console.error('移动节点更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '移动节点更新失败',
        },
      };
    }
    return { message: '文档节点移动成功' };
  }

  /**
   * 软删除文档节点
   * 
   * 将指定节点标记为已删除，但不从数据库中物理删除。
   * 软删除的节点可以通过恢复操作重新激活。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 要删除的节点key
   * @returns {Promise<{message: string}>} 删除结果
   * 
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await DocService.softDeleteNode('user123', 'nodeKey');
   */
  static async softDeleteNode(userId: string, key: string) {
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

    // 递归查找并软删除节点
    const softDeleteNode = (node: IDocNode, targetKey: string): boolean => {
      if (node.key === targetKey) {
        node.isDeleted = true;
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (softDeleteNode(child, targetKey)) {
            return true;
          }
        }
      }
      
      return false;
    };

    const success = softDeleteNode(doc.docTree, key);
    if (!success) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '节点不存在',
        },
      };
    }

    // 使用原子操作更新文档
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('软删除更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '软删除更新失败',
        },
      };
    }

    return { message: '文档节点删除成功' };
  }

  /**
   * 硬删除文档节点
   * 
   * 从数据库中永久删除指定节点，只能删除已软删除的节点。
   * 此操作不可逆，请谨慎使用。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 要删除的节点key
   * @returns {Promise<{message: string}>} 删除结果
   * 
   * @throws {400} 当节点未被软删除时
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await DocService.hardDeleteNode('user123', 'nodeKey');
   */
  static async hardDeleteNode(userId: string, key: string) {
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

    // 递归查找并硬删除节点（只能删除已软删除的节点）
    const hardDeleteNode = (node: IDocNode, targetKey: string): { success: boolean, error?: string } => {
      if (node.children) {
        const index = node.children.findIndex((child: IDocNode) => child.key === targetKey);
        if (index !== -1) {
          const targetNode = node.children[index];
          
          // 检查节点是否已经被软删除
          if (!targetNode.isDeleted) {
            return { 
              success: false, 
              error: '只能删除已软删除的节点，请先进行软删除操作', 
            };
          }
          
          // 执行硬删除
          node.children.splice(index, 1);
          return { success: true };
        }
        
        for (const child of node.children) {
          const result = hardDeleteNode(child, targetKey);
          if (result.success || result.error) {
            return result;
          }
        }
      }
      return { success: false, error: '节点不存在' };
    };

    const result = hardDeleteNode(doc.docTree, key);
    if (!result.success) {
      throw {
        status: 400,
        error: {
          code: result.error === '节点不存在' ? 'NOT_FOUND' : 'INVALID_OPERATION',
          message: result.error || '硬删除操作失败',
        },
      };
    }

    // 使用原子操作更新文档
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('硬删除更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '硬删除更新失败',
        },
      };
    }

    return { message: '文档节点永久删除成功' };
  }

  /**
   * 恢复文档节点
   * 
   * 恢复已软删除的节点，将其标记为未删除状态。
   * 
   * @param {string} userId - 用户ID
   * @param {string} key - 要恢复的节点key
   * @returns {Promise<{message: string}>} 恢复结果
   * 
   * @throws {404} 当文档树不存在时
   * @throws {404} 当节点不存在时
   * @throws {500} 当数据库操作失败时
   * 
   * @example
   * await DocService.restoreNode('user123', 'nodeKey');
   */
  static async restoreNode(userId: string, key: string) {
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

    // 递归查找并恢复节点
    const restoreNode = (node: IDocNode, targetKey: string): boolean => {
      if (node.key === targetKey) {
        node.isDeleted = false;
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (restoreNode(child, targetKey)) {
            return true;
          }
        }
      }
      
      return false;
    };

    const success = restoreNode(doc.docTree, key);
    if (!success) {
      throw {
        status: 404,
        error: {
          code: 'NOT_FOUND',
          message: '节点不存在',
        },
      };
    }

    // 使用原子操作更新文档
    const updateResult = await Doc.updateOne(
      { userId: doc.userId },
      { $set: { docTree: doc.docTree } },
    );
    
    if (updateResult.modifiedCount === 0) {
      console.error('恢复节点更新失败，没有修改任何记录');
      throw {
        status: 500,
        error: {
          code: 'UPDATE_ERROR',
          message: '恢复节点更新失败',
        },
      };
    }

    return { message: '文档节点恢复成功' };
  }
} 