import { Graph, Node } from '@antv/x6'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import insertCss from 'insert-css'
import { nextTick } from 'vue'
import { useMoteStore } from '@/stores/moteStore'

// ==================== 类型定义 ====================
interface MoteTree {
  id: string
  text: string
  collapsed: boolean
  parentId: string
  children?: MoteTree[]
}

interface ZoomRef {
  value: number
}

// ==================== 事件处理函数 ====================
/**
 * 选中指定节点
 */
export const selectNode = (
  graph: Graph,
  nodeId: string,
  moteStore: ReturnType<typeof useMoteStore>,
) => {
  if (!graph) return

  const node = graph.getCellById(nodeId) as Node
  if (node) {
    graph.cleanSelection()
    graph.select(node)

    const latestText = moteStore.findNodeText(moteStore.moteTree, nodeId)
    moteStore.selectedNode = {
      id: nodeId,
      label: latestText || node.prop('label') || '',
    }
    graph.centerCell(node)
  }
}

/**
 * 键盘事件处理
 */
export const handleKeyDown = (
  event: KeyboardEvent,
  moteStore: ReturnType<typeof useMoteStore>,
  renderGraph: () => void,
  selectNodeFn: (nodeId: string) => void,
) => {
  const keyboardHandler = moteStore.createKeyboardHandler(moteStore.isEditing, 'map')
  const result = keyboardHandler(event)

  // 如果快捷键被处理了，需要重新渲染图形
  if (result) {
    renderGraph()
    nextTick(() => {
      // 重新选中当前节点
      if (moteStore.selectedNodeId) {
        selectNodeFn(moteStore.selectedNodeId)
      }
    })
  }
}

/**
 * 滚轮缩放处理
 */
export const handleWheel = (e: WheelEvent, zoom: ZoomRef) => {
  if (e.ctrlKey || e.metaKey) return
  e.preventDefault()
  const delta = e.deltaY || e.detail || 0
  let next = zoom.value
  if (delta > 0) {
    next = Math.max(0.2, +(zoom.value - 0.05).toFixed(2))
  } else {
    next = Math.min(2, +(zoom.value + 0.05).toFixed(2))
  }
  zoom.value = next
}

// ==================== 图形事件监听 ====================
export const setupGraphEvents = (
  graph: Graph,
  moteStore: ReturnType<typeof useMoteStore>,
) => {
  if (!graph) return

  // 节点点击事件
  graph.on('node:click', ({ node }: { node: Node }) => {
    const { id } = node
    let label = node.prop('label') || ''

    if (!label) {
      label = moteStore.findNodeText(moteStore.moteTree, id)
    }

    // 如果点击的是已选中的节点，进入编辑状态
    if (moteStore.selectedNodeId === id) {
      moteStore.startEditing()
      nextTick(() => {
        // 等待 DOM 更新后聚焦输入框
        const focusTextarea = () => {
          const textarea = document.querySelector('.ant-card-body textarea') as HTMLTextAreaElement
          if (textarea) {
            console.log('graphEvents 聚焦输入框:', textarea)
            textarea.focus()
            textarea.select()
            return true
          } else {
            console.log('graphEvents 未找到输入框')
            return false
          }
        }

        // 多次尝试聚焦
        setTimeout(() => {
          if (!focusTextarea()) {
            setTimeout(() => {
              if (!focusTextarea()) {
                setTimeout(() => {
                  focusTextarea()
                }, 200)
              }
            }, 100)
          }
        }, 50)
      })
    } else {
      // 如果点击的是新节点，选中该节点
      moteStore.resetEditingState()
      moteStore.selectedNode = { id, label }
    }

    graph.centerCell(node)
  })

  // 点击空白区域清空选中
  graph.on('blank:click', () => {
    moteStore.resetEditingState()
    moteStore.selectedNode = { id: '', label: '' }
  })
}

// ==================== 插件初始化 ====================
export const initPlugins = (graph: Graph) => {
  if (!graph) return

  graph.use(new Selection())
  graph.use(new Keyboard())
}

// ==================== 样式初始化 ====================
export const initStyles = () => {
  // 添加选中节点样式
  insertCss(`
    .x6-node-selected rect {
      stroke-width: 2px;
    }
    .x6-node-selected[data-shape="topic-child"] rect {
      stroke-width: 0;
    }
    .x6-node-selected[data-shape="topic-child"] text {
      fill: #5F95FF !important;
    }
  `)
}

// ==================== 滚轮事件监听 ====================
export const setupWheelHandler = (zoom: ZoomRef) => {
  const container = document.getElementById('container')
  if (container) {
    const wheelHandler = (e: WheelEvent) => handleWheel(e, zoom)
    container.addEventListener('wheel', wheelHandler, { passive: false })
    return () => container.removeEventListener('wheel', wheelHandler)
  }
  return () => {}
}

// ==================== 键盘事件监听 ====================
export const setupKeyboardHandler = (
  moteStore: ReturnType<typeof useMoteStore>,
  renderGraph: () => void,
  selectNodeFn: (nodeId: string) => void,
) => {
  const keyboardHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, moteStore, renderGraph, selectNodeFn)
  document.addEventListener('keydown', keyboardHandler)
  return () => document.removeEventListener('keydown', keyboardHandler)
}

// ==================== 初始化 ====================
export const initGraphEvents = (
  graph: Graph,
  moteStore: ReturnType<typeof useMoteStore>,
  renderGraph: () => void,
  selectNodeFn: (nodeId: string) => void,
  zoom: ZoomRef,
) => {
  initPlugins(graph)
  setupGraphEvents(graph, moteStore)
  initStyles()

  const cleanupWheel = setupWheelHandler(zoom)
  const cleanupKeyboard = setupKeyboardHandler(moteStore, renderGraph, selectNodeFn)

  return () => {
    cleanupWheel()
    cleanupKeyboard()
  }
}
