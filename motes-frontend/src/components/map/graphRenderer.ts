import { Graph, Cell, Path } from '@antv/x6'
import Hierarchy from '@antv/hierarchy'

// ==================== 类型定义 ====================
type NodeType = 'topic' | 'topic-branch' | 'topic-child'

interface MoteTree {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteTree[]
}

interface MoteHierarchyResult {
  id: string
  x: number
  y: number
  data: MoteTree
  children?: MoteHierarchyResult[]
}

// ==================== 工具函数 ====================
/**
 * 根据节点层级判断节点类型
 */
export const getNodeTypeByLevel = (nodeData: MoteTree, level: number = 0): NodeType => {
  if (level === 0) return 'topic'
  if (level === 1) return 'topic-branch'
  return 'topic-child'
}

/**
 * 计算节点尺寸
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
export const renderGraph = (graph: Graph, data: MoteTree) => {
  if (!graph) return

  // 处理折叠状态
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
