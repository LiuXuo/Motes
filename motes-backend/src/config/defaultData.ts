import { generateId } from '../utils/idGenerator';

// 默认的mote数据
export const defaultMotes = {
  default01: {
    docId: 'default01',
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
  default02: {
    docId: 'default02',
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
  default03: {
    docId: 'default03',
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
};

// 生成默认文档树结构
export const generateDefaultDocTree = (userId: string) => {
  const defaultChildren = [
    {
      key: generateId(),
      title: '🎉 欢迎使用 Motes',
      type: 'folder' as const,
      isDeleted: false,
      children: [
        {
          key: generateId(),
          title: '📖 快速入门',
          type: 'folder' as const,
          isDeleted: false,
          children: [
            {
              key: 'default01',
              title: '思维导图视图',
              type: 'mote' as const,
              isDeleted: false,
            },
            {
              key: 'default02',
              title: '大纲笔记视图',
              type: 'mote' as const,
              isDeleted: false,
            },
          ],
        },
      ],
    },
    {
      key: generateId(),
      title: '🎯 侧边栏操作',
      type: 'folder' as const,
      isDeleted: false,
      children: [
        {
          key: generateId(),
          title: '🖱️ 右键菜单',
          type: 'folder' as const,
          isDeleted: false,
          children: [],
        },
        {
          key: generateId(),
          title: '📦 拖拽移动',
          type: 'folder' as const,
          isDeleted: false,
          children: [
            {
              key: generateId(),
              title: '拖拽改变位置',
              type: 'mote' as const,
              isDeleted: false,
            },
            {
              key: generateId(),
              title: '拖拽改变层级',
              type: 'folder' as const,
              isDeleted: false,
            },
          ],
        },
      ],
    },
    {
      key: 'default03',
      title: '人工智能发展',
      type: 'mote' as const,
      isDeleted: false,
    },
    {
      key: generateId(),
      title: '右键可恢复删除',
      type: 'folder' as const,
      isDeleted: true,
    },
  ];

  return {
    key: userId,
    title: '我的文档',
    type: 'folder',
    isDeleted: false,
    children: defaultChildren,
  };
}; 