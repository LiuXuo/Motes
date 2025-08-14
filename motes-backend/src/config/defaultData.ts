/**
 * 默认数据配置文件
 * 
 * 定义系统初始化时的默认数据，包括：
 * - 默认思维导图模板
 * - 默认文档树结构
 * - 示例数据用于演示和测试
 * - 新用户首次使用时的引导数据
 * 
 * 这些数据为新用户提供良好的初始体验，展示系统的核心功能。
 */

import { generateId } from '../utils/idGenerator';

const default01 = generateId();
const default02 = generateId();
const default03 = generateId();

/**
 * 默认mote数据
 */
export const defaultMote01 = {
  'zh-CN': {
    default01: {
      docId: default01,
      moteTree: {
        id: 'default01',
        text: '思维导图视图',
        collapsed: false,
        parentId: 'default01',
        children: [
          {
            id: 'default_A1',
            text: '核心功能',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_B2',
                text: '可视化思维',
                collapsed: false,
                parentId: 'default_A1',
                children: [
                  {
                    id: 'default_C3',
                    text: '放射状布局',
                    collapsed: false,
                    parentId: 'default_B2',
                    children: [],
                  },
                  {
                    id: 'default_D4',
                    text: '层级关系清晰',
                    collapsed: false,
                    parentId: 'default_B2',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_E5',
                text: '快速操作',
                collapsed: false,
                parentId: 'default_A1',
                children: [
                  {
                    id: 'default_F6',
                    text: 'Enter添加子节点',
                    collapsed: false,
                    parentId: 'default_E5',
                    children: [],
                  },
                  {
                    id: 'default_G7',
                    text: 'Shift+Enter添加同级',
                    collapsed: false,
                    parentId: 'default_E5',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'default_H8',
            text: '导航控制',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_I9',
                text: '方向键导航',
                collapsed: false,
                parentId: 'default_H8',
                children: [
                  {
                    id: 'default_J0',
                    text: '↑↓同级切换',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                  {
                    id: 'default_Ka',
                    text: '←选中父节点',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                  {
                    id: 'default_Lb',
                    text: '→展开子节点',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Mc',
                text: '层级调整',
                collapsed: false,
                parentId: 'default_H8',
                children: [
                  {
                    id: 'default_Nd',
                    text: 'Tab降级',
                    collapsed: false,
                    parentId: 'default_Mc',
                    children: [],
                  },
                  {
                    id: 'default_Oe',
                    text: 'Shift+Tab升级',
                    collapsed: false,
                    parentId: 'default_Mc',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'default_Pf',
            text: '编辑功能',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_Qg',
                text: 'F2编辑节点',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
              {
                id: 'default_Rh',
                text: 'Delete删除节点',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
              {
                id: 'default_Si',
                text: 'Alt+.折叠展开',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
            ],
          },
          {
            id: 'default_Tj',
            text: '画布操作',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_Uk',
                text: '滚轮缩放画布',
                collapsed: false,
                parentId: 'default_Tj',
                children: [],
              },
              {
                id: 'default_Vl',
                text: '鼠标拖动画布',
                collapsed: false,
                parentId: 'default_Tj',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
  'en-US': {
    default01: {
      docId: default01,
      moteTree: {
        id: 'default01',
        text: 'Mind Map View',
        collapsed: false,
        parentId: 'default01',
        children: [
          {
            id: 'default_A1',
            text: 'Core Features',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_B2',
                text: 'Visual Thinking',
                collapsed: false,
                parentId: 'default_A1',
                children: [
                  {
                    id: 'default_C3',
                    text: 'Radial Layout',
                    collapsed: false,
                    parentId: 'default_B2',
                    children: [],
                  },
                  {
                    id: 'default_D4',
                    text: 'Clear Hierarchy',
                    collapsed: false,
                    parentId: 'default_B2',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_E5',
                text: 'Quick Operations',
                collapsed: false,
                parentId: 'default_A1',
                children: [
                  {
                    id: 'default_F6',
                    text: 'Enter to add child node',
                    collapsed: false,
                    parentId: 'default_E5',
                    children: [],
                  },
                  {
                    id: 'default_G7',
                    text: 'Shift+Enter to add sibling',
                    collapsed: false,
                    parentId: 'default_E5',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'default_H8',
            text: 'Navigation Control',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_I9',
                text: 'Arrow Key Navigation',
                collapsed: false,
                parentId: 'default_H8',
                children: [
                  {
                    id: 'default_J0',
                    text: '↑↓ Switch between siblings',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                  {
                    id: 'default_Ka',
                    text: '← Select parent node',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                  {
                    id: 'default_Lb',
                    text: '→ Expand child nodes',
                    collapsed: false,
                    parentId: 'default_I9',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Mc',
                text: 'Level Adjustment',
                collapsed: false,
                parentId: 'default_H8',
                children: [
                  {
                    id: 'default_Nd',
                    text: 'Tab to demote',
                    collapsed: false,
                    parentId: 'default_Mc',
                    children: [],
                  },
                  {
                    id: 'default_Oe',
                    text: 'Shift+Tab to promote',
                    collapsed: false,
                    parentId: 'default_Mc',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'default_Pf',
            text: 'Edit Functions',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_Qg',
                text: 'F2 to edit node',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
              {
                id: 'default_Rh',
                text: 'Delete to remove node',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
              {
                id: 'default_Si',
                text: 'Alt+. to collapse/expand',
                collapsed: false,
                parentId: 'default_Pf',
                children: [],
              },
            ],
          },
          {
            id: 'default_Tj',
            text: 'Canvas Operations',
            collapsed: false,
            parentId: 'default01',
            children: [
              {
                id: 'default_Uk',
                text: 'Mouse wheel to zoom canvas',
                collapsed: false,
                parentId: 'default_Tj',
                children: [],
              },
              {
                id: 'default_Vl',
                text: 'Mouse drag to move canvas',
                collapsed: false,
                parentId: 'default_Tj',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
};

export const defaultMote02 = {
  'zh-CN': {
    default02: {
      docId: default02,
      moteTree: {
        id: 'default02',
        text: '大纲笔记视图',
        collapsed: false,
        parentId: 'default02',
        children: [
          {
            id: 'default_Wm',
            text: '视图切换',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Xn',
                text: '点击右上角分段控件切换视图',
                collapsed: false,
                parentId: 'default_Wm',
                children: [],
              },
              {
                id: 'default_Yo',
                text: '右侧快捷键卡片可以关闭',
                collapsed: false,
                parentId: 'default_Wm',
                children: [],
              },
            ],
          },
          {
            id: 'default_Zp',
            text: '大纲视图的优势',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Aq',
                text: '层级结构清晰，便于理解复杂内容的组织关系',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
              {
                id: 'default_Br',
                text: '支持折叠展开，可以隐藏不重要的内容，专注于当前任务',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
              {
                id: 'default_Cs',
                text: '便于快速浏览和定位，适合长文档的导航和阅读',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
            ],
          },
          {
            id: 'default_Dt',
            text: '操作方式',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Eu',
                text: 'Enter添加子节点',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Fv',
                text: 'Shift+Enter添加同级节点',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Gw',
                text: 'Delete删除节点',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Hx',
                text: 'F2编辑节点内容',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
            ],
          },
          {
            id: 'default_Iy',
            text: '导航特点',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Jz',
                text: '↑↓上下节点切换（扁平化导航）',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
              {
                id: 'default_K1',
                text: '←选中父节点',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
              {
                id: 'default_L2',
                text: '→展开或选中子节点',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
            ],
          },
          {
            id: 'default_M3',
            text: '层级调整',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_N4',
                text: 'Tab节点降级',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
              {
                id: 'default_O5',
                text: 'Shift+Tab节点升级',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
              {
                id: 'default_P6',
                text: 'Ctrl+↑↓同级移动',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
            ],
          },
          {
            id: 'default_Q7',
            text: '其他功能',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_R8',
                text: 'Alt+.折叠展开节点',
                collapsed: false,
                parentId: 'default_Q7',
                children: [],
              },
              {
                id: 'default_S9',
                text: 'Escape取消选中',
                collapsed: false,
                parentId: 'default_Q7',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
  'en-US': {
    default02: {
      docId: default02,
      moteTree: {
        id: 'default02',
        text: 'Outline Note View',
        collapsed: false,
        parentId: 'default02',
        children: [
          {
            id: 'default_Wm',
            text: 'View Switching',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Xn',
                text: 'Click the segment control in the top right to switch views',
                collapsed: false,
                parentId: 'default_Wm',
                children: [],
              },
              {
                id: 'default_Yo',
                text: 'The shortcut card on the right can be closed',
                collapsed: false,
                parentId: 'default_Wm',
                children: [],
              },
            ],
          },
          {
            id: 'default_Zp',
            text: 'Advantages of Outline View',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Aq',
                text: 'Clear hierarchical structure, easy to understand complex content organization',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
              {
                id: 'default_Br',
                text: 'Support collapse/expand, hide unimportant content, focus on current tasks',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
              {
                id: 'default_Cs',
                text: 'Easy to browse and locate, suitable for long document navigation and reading',
                collapsed: false,
                parentId: 'default_Zp',
                children: [],
              },
            ],
          },
          {
            id: 'default_Dt',
            text: 'Operation Methods',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Eu',
                text: 'Enter to add child node',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Fv',
                text: 'Shift+Enter to add sibling node',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Gw',
                text: 'Delete to remove node',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
              {
                id: 'default_Hx',
                text: 'F2 to edit node content',
                collapsed: false,
                parentId: 'default_Dt',
                children: [],
              },
            ],
          },
          {
            id: 'default_Iy',
            text: 'Navigation Features',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_Jz',
                text: '↑↓ Switch between nodes (flattened navigation)',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
              {
                id: 'default_K1',
                text: '← Select parent node',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
              {
                id: 'default_L2',
                text: '→ Expand or select child node',
                collapsed: false,
                parentId: 'default_Iy',
                children: [],
              },
            ],
          },
          {
            id: 'default_M3',
            text: 'Level Adjustment',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_N4',
                text: 'Tab to demote node',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
              {
                id: 'default_O5',
                text: 'Shift+Tab to promote node',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
              {
                id: 'default_P6',
                text: 'Ctrl+↑↓ Move at same level',
                collapsed: false,
                parentId: 'default_M3',
                children: [],
              },
            ],
          },
          {
            id: 'default_Q7',
            text: 'Other Functions',
            collapsed: false,
            parentId: 'default02',
            children: [
              {
                id: 'default_R8',
                text: 'Alt+. to collapse/expand node',
                collapsed: false,
                parentId: 'default_Q7',
                children: [],
              },
              {
                id: 'default_S9',
                text: 'Escape to cancel selection',
                collapsed: false,
                parentId: 'default_Q7',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
};

export const defaultMote03 = {
  'zh-CN': {
    default03: {
      docId: default03,
      moteTree: {
        id: 'default03',
        text: '人工智能发展',
        collapsed: false,
        parentId: 'default03',
        children: [
          {
            id: 'default_Ta',
            text: '机器学习',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Ub',
                text: '监督学习',
                collapsed: false,
                parentId: 'default_Ta',
                children: [
                  {
                    id: 'default_Vc',
                    text: '分类算法',
                    collapsed: false,
                    parentId: 'default_Ub',
                    children: [
                      {
                        id: 'default_Wd',
                        text: '决策树是一种基于树形结构的分类和回归算法，通过递归地将数据集分割成更小的子集来构建模型，每个内部节点表示一个特征测试，每个叶节点表示一个预测结果',
                        collapsed: false,
                        parentId: 'default_Vc',
                        children: [],
                      },
                      {
                        id: 'default_Xe',
                        text: '支持向量机是一种强大的监督学习算法，通过寻找最优超平面来分离不同类别的数据点，具有很好的泛化能力和处理高维数据的能力',
                        collapsed: false,
                        parentId: 'default_Vc',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Yf',
                    text: '回归算法用于预测连续数值输出，包括线性回归、多项式回归、岭回归等多种方法，通过最小化预测值与真实值之间的误差来训练模型',
                    collapsed: false,
                    parentId: 'default_Ub',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Zg',
                text: '无监督学习在没有标签的情况下发现数据中的隐藏模式和结构，包括聚类、降维、异常检测等技术，广泛应用于数据探索和特征提取',
                collapsed: false,
                parentId: 'default_Ta',
                children: [],
              },
            ],
          },
          {
            id: 'default_Ah',
            text: '深度学习',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Bi',
                text: '神经网络',
                collapsed: false,
                parentId: 'default_Ah',
                children: [
                  {
                    id: 'default_Cj',
                    text: '卷积神经网络',
                    collapsed: false,
                    parentId: 'default_Bi',
                    children: [
                      {
                        id: 'default_Dk',
                        text: '图像识别',
                        collapsed: false,
                        parentId: 'default_Cj',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_El',
                    text: '循环神经网络专门处理序列数据，通过循环连接保持状态信息，在自然语言处理、语音识别、时间序列预测等领域表现出色',
                    collapsed: false,
                    parentId: 'default_Bi',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Fm',
                text: '强化学习通过智能体与环境的交互来学习最优策略，通过奖励机制指导学习过程，在游戏AI、机器人控制、自动驾驶等领域有重要应用',
                collapsed: false,
                parentId: 'default_Ah',
                children: [],
              },
            ],
          },
          {
            id: 'default_Gn',
            text: '自然语言处理',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Ho',
                text: '语言模型',
                collapsed: false,
                parentId: 'default_Gn',
                children: [
                  {
                    id: 'default_Ip',
                    text: 'Transformer架构',
                    collapsed: false,
                    parentId: 'default_Ho',
                    children: [
                      {
                        id: 'default_Jq',
                        text: 'GPT系列',
                        collapsed: false,
                        parentId: 'default_Ip',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Kr',
                    text: 'BERT模型是一种基于Transformer的双向编码器，通过预训练和微调的方式在多种自然语言处理任务上取得了突破性进展',
                    collapsed: false,
                    parentId: 'default_Ho',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Ls',
                text: '机器翻译利用神经网络和深度学习技术将一种语言的文本自动翻译成另一种语言，近年来在翻译质量和流畅度方面取得了显著提升',
                collapsed: false,
                parentId: 'default_Gn',
                children: [],
              },
            ],
          },
          {
            id: 'default_Mt',
            text: '计算机视觉',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Nu',
                text: '目标检测',
                collapsed: false,
                parentId: 'default_Mt',
                children: [
                  {
                    id: 'default_Ov',
                    text: 'YOLO算法',
                    collapsed: false,
                    parentId: 'default_Nu',
                    children: [
                      {
                        id: 'default_Pw',
                        text: '实时检测',
                        collapsed: false,
                        parentId: 'default_Ov',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Qx',
                    text: 'R-CNN系列',
                    collapsed: false,
                    parentId: 'default_Nu',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Ry',
                text: '图像分割将图像中的每个像素分配到不同的类别，包括语义分割、实例分割和全景分割，在医学影像、自动驾驶等领域有重要应用',
                collapsed: false,
                parentId: 'default_Mt',
                children: [],
              },
            ],
          },
          {
            id: 'default_Sz',
            text: '应用领域',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_T1',
                text: '自动驾驶',
                collapsed: false,
                parentId: 'default_Sz',
                children: [
                  {
                    id: 'default_U2',
                    text: '感知系统',
                    collapsed: false,
                    parentId: 'default_T1',
                    children: [
                      {
                        id: 'default_V3',
                        text: '激光雷达',
                        collapsed: false,
                        parentId: 'default_U2',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_W4',
                    text: '决策系统',
                    collapsed: false,
                    parentId: 'default_T1',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_X5',
                text: '医疗诊断利用人工智能技术分析医学影像、病理切片和临床数据，辅助医生进行疾病诊断和治疗方案制定，提高诊断准确率',
                collapsed: false,
                parentId: 'default_Sz',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
  'en-US': {
    default03: {
      docId: default03,
      moteTree: {
        id: 'default03',
        text: 'Artificial Intelligence Development',
        collapsed: false,
        parentId: 'default03',
        children: [
          {
            id: 'default_Ta',
            text: 'Machine Learning',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Ub',
                text: 'Supervised Learning',
                collapsed: false,
                parentId: 'default_Ta',
                children: [
                  {
                    id: 'default_Vc',
                    text: 'Classification Algorithms',
                    collapsed: false,
                    parentId: 'default_Ub',
                    children: [
                      {
                        id: 'default_Wd',
                        text: 'Decision trees are tree-structured classification and regression algorithms that build models by recursively partitioning datasets into smaller subsets, with each internal node representing a feature test and each leaf node representing a prediction result',
                        collapsed: false,
                        parentId: 'default_Vc',
                        children: [],
                      },
                      {
                        id: 'default_Xe',
                        text: 'Support Vector Machines are powerful supervised learning algorithms that separate different classes of data points by finding optimal hyperplanes, with excellent generalization ability and capability to handle high-dimensional data',
                        collapsed: false,
                        parentId: 'default_Vc',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Yf',
                    text: 'Regression algorithms predict continuous numerical outputs, including linear regression, polynomial regression, ridge regression, and other methods, training models by minimizing the error between predicted and true values',
                    collapsed: false,
                    parentId: 'default_Ub',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Zg',
                text: 'Unsupervised learning discovers hidden patterns and structures in data without labels, including clustering, dimensionality reduction, anomaly detection, and other techniques, widely applied in data exploration and feature extraction',
                collapsed: false,
                parentId: 'default_Ta',
                children: [],
              },
            ],
          },
          {
            id: 'default_Ah',
            text: 'Deep Learning',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Bi',
                text: 'Neural Networks',
                collapsed: false,
                parentId: 'default_Ah',
                children: [
                  {
                    id: 'default_Cj',
                    text: 'Convolutional Neural Networks',
                    collapsed: false,
                    parentId: 'default_Bi',
                    children: [
                      {
                        id: 'default_Dk',
                        text: 'Image Recognition',
                        collapsed: false,
                        parentId: 'default_Cj',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_El',
                    text: 'Recurrent Neural Networks specialize in processing sequential data, maintaining state information through recurrent connections, excelling in natural language processing, speech recognition, time series prediction, and other fields',
                    collapsed: false,
                    parentId: 'default_Bi',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Fm',
                text: 'Reinforcement learning learns optimal strategies through agent-environment interactions, guided by reward mechanisms, with important applications in game AI, robot control, autonomous driving, and other fields',
                collapsed: false,
                parentId: 'default_Ah',
                children: [],
              },
            ],
          },
          {
            id: 'default_Gn',
            text: 'Natural Language Processing',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Ho',
                text: 'Language Models',
                collapsed: false,
                parentId: 'default_Gn',
                children: [
                  {
                    id: 'default_Ip',
                    text: 'Transformer Architecture',
                    collapsed: false,
                    parentId: 'default_Ho',
                    children: [
                      {
                        id: 'default_Jq',
                        text: 'GPT Series',
                        collapsed: false,
                        parentId: 'default_Ip',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Kr',
                    text: 'BERT model is a bidirectional encoder based on Transformer, achieving breakthrough progress in various natural language processing tasks through pre-training and fine-tuning approaches',
                    collapsed: false,
                    parentId: 'default_Ho',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Ls',
                text: 'Machine translation automatically translates text from one language to another using neural networks and deep learning techniques, achieving significant improvements in translation quality and fluency in recent years',
                collapsed: false,
                parentId: 'default_Gn',
                children: [],
              },
            ],
          },
          {
            id: 'default_Mt',
            text: 'Computer Vision',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_Nu',
                text: 'Object Detection',
                collapsed: false,
                parentId: 'default_Mt',
                children: [
                  {
                    id: 'default_Ov',
                    text: 'YOLO Algorithm',
                    collapsed: false,
                    parentId: 'default_Nu',
                    children: [
                      {
                        id: 'default_Pw',
                        text: 'Real-time Detection',
                        collapsed: false,
                        parentId: 'default_Ov',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_Qx',
                    text: 'R-CNN Series',
                    collapsed: false,
                    parentId: 'default_Nu',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_Ry',
                text: 'Image segmentation assigns each pixel in an image to different categories, including semantic segmentation, instance segmentation, and panoramic segmentation, with important applications in medical imaging, autonomous driving, and other fields',
                collapsed: false,
                parentId: 'default_Mt',
                children: [],
              },
            ],
          },
          {
            id: 'default_Sz',
            text: 'Application Fields',
            collapsed: false,
            parentId: 'default03',
            children: [
              {
                id: 'default_T1',
                text: 'Autonomous Driving',
                collapsed: false,
                parentId: 'default_Sz',
                children: [
                  {
                    id: 'default_U2',
                    text: 'Perception System',
                    collapsed: false,
                    parentId: 'default_T1',
                    children: [
                      {
                        id: 'default_V3',
                        text: 'LiDAR',
                        collapsed: false,
                        parentId: 'default_U2',
                        children: [],
                      },
                    ],
                  },
                  {
                    id: 'default_W4',
                    text: 'Decision System',
                    collapsed: false,
                    parentId: 'default_T1',
                    children: [],
                  },
                ],
              },
              {
                id: 'default_X5',
                text: 'Medical diagnosis uses artificial intelligence technology to analyze medical images, pathological slides, and clinical data, assisting doctors in disease diagnosis and treatment planning, improving diagnostic accuracy',
                collapsed: false,
                parentId: 'default_Sz',
                children: [],
              },
            ],
          },
        ],
      },
    },
  },
};

// 生成默认文档树结构
export const generateDefaultDocTree = (userId: string, language: 'zh-CN' | 'en-US' = 'zh-CN') => {
  // 根据语言选择对应的标题
  const titles = {
    'zh-CN': {
      welcome: '🎉 欢迎使用 Motes',
      quickStart: '📖 快速入门',
      mindMapView: '思维导图视图',
      outlineView: '大纲笔记视图',
      sidebarOps: '🎯 侧边栏操作',
      rightClickMenu: '🖱️ 右键菜单',
      dragMove: '📦 拖拽移动',
      dragPosition: '拖拽改变位置',
      dragLevel: '拖拽改变层级',
      aiDevelopment: '人工智能发展',
      restoreDeleted: '右键可恢复删除',
      myDocuments: '我的文档',
    },
    'en-US': {
      welcome: '🎉 Welcome to Motes',
      quickStart: '📖 Quick Start',
      mindMapView: 'Mind Map View',
      outlineView: 'Outline Note View',
      sidebarOps: '🎯 Sidebar Operations',
      rightClickMenu: '🖱️ Right-click Menu',
      dragMove: '📦 Drag & Move',
      dragPosition: 'Drag to change position',
      dragLevel: 'Drag to change level',
      aiDevelopment: 'AI Development',
      restoreDeleted: 'Right-click to restore deleted',
      myDocuments: 'My Documents',
    },
  };

  const t = titles[language];

  const defaultChildren = [
    {
      key: generateId(),
      title: t.welcome,
      type: 'folder' as const,
      isDeleted: false,
      children: [
        {
          key: generateId(),
          title: t.quickStart,
          type: 'folder' as const,
          isDeleted: false,
          children: [
            {
              key: default01,
              title: t.mindMapView,
              type: 'mote' as const,
              isDeleted: false,
            },
            {
              key: default02,
              title: t.outlineView,
              type: 'mote' as const,
              isDeleted: false,
            },
          ],
        },
      ],
    },
    {
      key: generateId(),
      title: t.sidebarOps,
      type: 'folder' as const,
      isDeleted: false,
      children: [
        {
          key: generateId(),
          title: t.rightClickMenu,
          type: 'folder' as const,
          isDeleted: false,
          children: [],
        },
        {
          key: generateId(),
          title: t.dragMove,
          type: 'folder' as const,
          isDeleted: false,
          children: [
            {
              key: generateId(),
              title: t.dragPosition,
              type: 'mote' as const,
              isDeleted: false,
            },
            {
              key: generateId(),
              title: t.dragLevel,
              type: 'folder' as const,
              isDeleted: false,
            },
          ],
        },
      ],
    },
    {
      key: default03,
      title: t.aiDevelopment,
      type: 'mote' as const,
      isDeleted: false,
    },
    {
      key: generateId(),
      title: t.restoreDeleted,
      type: 'folder' as const,
      isDeleted: true,
    },
  ];

  return {
    key: userId,
    title: t.myDocuments,
    type: 'folder',
    isDeleted: false,
    children: defaultChildren,
  };
}; 