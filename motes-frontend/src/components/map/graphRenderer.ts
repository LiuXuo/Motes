/**
 * 思维导图图形渲染器
 *
 * 基于 AntV X6 图形库实现思维导图的渲染功能，包括：
 * - 节点类型注册和样式定义
 * - 连接器和边的样式配置
 * - 层级布局算法集成
 * - 图形渲染和更新
 *
 * @module graphRenderer
 * @example
 * import { registerNodeTypes, renderGraph } from './graphRenderer'
 *
 * // 注册节点类型
 * registerNodeTypes()
 *
 * // 渲染图形
 * renderGraph(graph, moteTreeData)
 */

import { Graph, Cell, Path } from '@antv/x6'
import Hierarchy from '@antv/hierarchy'

// ==================== 类型定义 ====================
/**
 * 节点类型枚举
 *
 * 定义思维导图中不同层级的节点类型：
 * - topic: 中心主题节点
 * - topic-branch: 分支主题节点
 * - topic-child: 子主题节点
 */
type NodeType = 'topic' | 'topic-branch' | 'topic-child'

/**
 * 脑图树节点接口
 *
 * 定义脑图树中每个节点的数据结构
 */
interface MoteTree {
  /** 节点唯一标识符 */
  id: string
  /** 节点文本内容 */
  text: string
  /** 节点是否折叠（隐藏子节点） */
  collapsed: boolean
  /** 父节点ID，根节点为空字符串 */
  parentId: string
  /** 子节点数组，可选 */
  children?: MoteTree[]
}

/**
 * 层级布局结果接口
 *
 * 定义层级布局算法返回的结果结构
 */
interface MoteHierarchyResult {
  /** 节点ID */
  id: string
  /** 节点X坐标 */
  x: number
  /** 节点Y坐标 */
  y: number
  /** 节点数据 */
  data: MoteTree
  /** 子节点数组，可选 */
  children?: MoteHierarchyResult[]
}

// ==================== 工具函数 ====================
/**
 * 根据节点层级判断节点类型
 *
 * 根据节点在树中的层级深度确定其类型：
 * - 第0层：中心主题节点
 * - 第1层：分支主题节点
 * - 第2层及以上：子主题节点
 *
 * @param {MoteTree} nodeData - 节点数据
 * @param {number} level - 节点层级，默认为0
 * @returns {NodeType} 节点类型
 *
 * @example
 * const nodeType = getNodeTypeByLevel(nodeData, 1) // 'topic-branch'
 */
export const getNodeTypeByLevel = (nodeData: MoteTree, level: number = 0): NodeType => {
  if (level === 0) return 'topic'
  if (level === 1) return 'topic-branch'
  return 'topic-child'
}

/**
 * 计算节点尺寸
 *
 * 根据节点文本内容和类型计算合适的节点尺寸，
 * 支持不同层级节点的不同尺寸配置。
 *
 * @param {string} text - 节点文本内容
 * @param {NodeType} type - 节点类型
 * @returns {object} 包含宽度和高度的尺寸对象
 *
 * @example
 * const size = calculateNodeSize('示例文本', 'topic-branch')
 * // { width: 160, height: 50 }
 */
export const calculateNodeSize = (text: string, type: NodeType) => {
  const textLength = text.length
  const config = {
    topic: { baseWidth: 200, baseHeight: 60, fontSize: 18, maxWidth: 300 },
    'topic-branch': { baseWidth: 160, baseHeight: 50, fontSize: 16, maxWidth: 250 },
    'topic-child': { baseWidth: 140, baseHeight: 40, fontSize: 14, maxWidth: 200 },
  }

  const { baseWidth, baseHeight, fontSize, maxWidth } = config[type]
  const estimatedWidth = Math.max(baseWidth, textLength * fontSize * 1.5)
  const lines = Math.ceil((textLength * fontSize * 0.8) / maxWidth)
  const lineHeight = fontSize * 1.5
  const calculatedHeight = Math.max(baseHeight, lines * lineHeight + 30)

  return {
    width: Math.min(estimatedWidth, maxWidth),
    height: calculatedHeight,
  }
}

// ==================== 节点类型注册 ====================
/**
 * 注册节点类型
 *
 * 向 AntV X6 图形库注册三种自定义节点类型：
 * - topic: 中心主题节点（深色背景，白色文字）
 * - topic-branch: 分支主题节点（浅色背景，深色文字）
 * - topic-child: 子主题节点（透明背景，带连接线）
 *
 * @example
 * registerNodeTypes()
 * // 注册所有节点类型
 */
export const registerNodeTypes = () => {
  // 中心主题节点
  Graph.registerNode(
    'topic',
    {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' },
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          stroke: '#5F95FF',
          fill: '#1F1F1F',
          strokeWidth: 0,
        },
        label: {
          fontSize: 18,
          fill: '#FFFFFF',
          fontWeight: 'bold',
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          lineHeight: 27,
          textWrap: { ellipsis: false },
          refX: '50%',
          refY: '50%',
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: -20,
          refHeight2: -20,
        },
      },
    },
    true,
  )

  // 分支主题节点
  Graph.registerNode(
    'topic-branch',
    {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' },
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
          strokeWidth: 1,
        },
        label: {
          fontSize: 16,
          fill: '#262626',
          fontWeight: 'normal',
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          lineHeight: 24,
          textWrap: { ellipsis: false },
          refX: '50%',
          refY: '50%',
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: -16,
          refHeight2: -16,
        },
      },
    },
    true,
  )

  // 子主题节点
  Graph.registerNode(
    'topic-child',
    {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'text', selector: 'label' },
        { tagName: 'path', selector: 'line' },
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          fill: 'transparent',
          strokeWidth: 0,
          stroke: '#5F95FF',
        },
        label: {
          fontSize: 14,
          fill: '#262626',
          fontWeight: 'normal',
          textVerticalAnchor: 'bottom',
          textAnchor: 'middle',
          lineHeight: 21,
          textWrap: { ellipsis: false },
          refX: '50%',
          refY: '50%',
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: -12,
          refHeight2: -12,
        },
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          d: 'M 0 15 L 60 15',
          refY: '50%',
          refY2: 0,
        },
      },
    },
    true,
  )
}

// ==================== 连接器和边注册 ====================
/**
 * 注册连接器和边样式
 *
 * 向 AntV X6 图形库注册思维导图专用的连接器和边样式：
 * - mindmap: 思维导图连接器（曲线连接）
 * - mindmap-edge: 思维导图边样式
 *
 * @example
 * registerConnectors()
 * // 注册连接器和边样式
 */
export const registerConnectors = () => {
  // 思维导图连接器
  Graph.registerConnector(
    'mindmap',
    (sourcePoint, targetPoint, routerPoints, options) => {
      const midX = sourcePoint.x + 15
      const midY = sourcePoint.y
      const ctrX = (targetPoint.x - midX) / 5 + midX
      const ctrY = targetPoint.y
      const pathData = `
       M ${sourcePoint.x} ${sourcePoint.y}
       L ${midX} ${midY}
       Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
      `
      return options.raw ? Path.parse(pathData) : pathData
    },
    true,
  )

  // 思维导图边
  Graph.registerEdge(
    'mindmap-edge',
    {
      inherit: 'edge',
      connector: { name: 'mindmap' },
      attrs: {
        line: {
          targetMarker: '',
          stroke: '#A2B1C3',
          strokeWidth: 2,
        },
      },
      zIndex: 0,
    },
    true,
  )
}

// ==================== 图形渲染 ====================
/**
 * 渲染思维导图
 *
 * 使用层级布局算法渲染完整的思维导图，包括：
 * - 处理节点折叠状态
 * - 计算节点位置和尺寸
 * - 创建节点和连接边
 * - 设置节点样式和交互
 *
 * @param {Graph} graph - AntV X6 图形实例
 * @param {MoteTree} data - 脑图树数据
 *
 * @example
 * renderGraph(graphInstance, moteTreeData)
 * // 渲染完整的思维导图
 */
export const renderGraph = (graph: Graph, data: MoteTree) => {
  if (!graph) return

  /**
   * 处理折叠状态
   *
   * 递归处理节点树，将折叠节点的子节点清空
   *
   * @param {MoteTree} nodeData - 节点数据
   * @returns {MoteTree} 处理后的节点数据
   */
  const processCollapsedData = (nodeData: MoteTree): MoteTree => {
    const processed = { ...nodeData }
    if (processed.collapsed && processed.children) {
      processed.children = []
    } else if (processed.children) {
      processed.children = processed.children.map(processCollapsedData)
    }
    return processed
  }

  const processedData = processCollapsedData(data)

  // 使用层级布局算法计算节点位置
  const result = Hierarchy.mindmap(processedData, {
    direction: 'H',
    getHeight(d: unknown) {
      const data = d as MoteTree
      const { height } = calculateNodeSize(data.text, getNodeTypeByLevel(data))
      return height
    },
    getWidth(d: unknown) {
      const data = d as MoteTree
      const { width } = calculateNodeSize(data.text, getNodeTypeByLevel(data))
      return width
    },
    getHGap() {
      return 40
    },
    getVGap() {
      return 20
    },
    getSide: () => 'right',
  })

  const cells: Cell[] = []

  /**
   * 遍历层级结果创建图形元素
   *
   * 递归遍历层级布局结果，创建节点和连接边
   *
   * @param {MoteHierarchyResult} hierarchyItem - 层级结果项
   * @param {number} level - 当前层级
   */
  const traverse = (hierarchyItem: MoteHierarchyResult, level: number = 0) => {
    if (hierarchyItem) {
      const { data, children } = hierarchyItem
      const nodeType = getNodeTypeByLevel(data, level)
      const shapeType = nodeType === 'topic' ? 'topic' : nodeType

      const { width, height } = calculateNodeSize(data.text, nodeType)
      const node = graph.createNode({
        id: data.id,
        shape: shapeType,
        x: hierarchyItem.x,
        y: hierarchyItem.y,
        width: width,
        height: height,
        label: data.text,
      })

      // 根据折叠状态设置字体粗细
      if (data.collapsed) {
        node.setAttrByPath('label/fontWeight', 'bold')
      } else {
        node.setAttrByPath('label/fontWeight', nodeType === 'topic' ? 'bold' : 'normal')
      }

      // 子主题动态调整线条位置
      if (nodeType === 'topic-child') {
        node.setAttrByPath('line/d', `M 0 0 L ${width} 0`)
      }

      cells.push(node)

      if (children) {
        children.forEach((item) => {
          const { id, data } = item
          cells.push(
            graph.createEdge({
              shape: 'mindmap-edge',
              source: {
                cell: hierarchyItem.id,
                anchor:
                  getNodeTypeByLevel(data, level + 1) === 'topic-child'
                    ? { name: 'right', args: { dx: -16 } }
                    : { name: 'center', args: { dx: '25%' } },
              },
              target: {
                cell: id,
                anchor: { name: 'left' },
              },
            }),
          )
          traverse(item as MoteHierarchyResult, level + 1)
        })
      }
    }
  }

  traverse(result as MoteHierarchyResult)
  graph.resetCells(cells)
  graph.centerContent()
}
