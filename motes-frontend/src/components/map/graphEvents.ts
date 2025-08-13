/**
 * 思维导图事件处理模块
 *
 * 负责处理思维导图的各种交互事件，包括：
 * - 节点选中和编辑
 * - 键盘快捷键处理
 * - 鼠标滚轮缩放
 * - 图形事件监听
 * - 插件初始化和样式设置
 *
 * @module graphEvents
 * @example
 * import { initGraphEvents, selectNode } from './graphEvents'
 *
 * // 初始化图形事件
 * const cleanup = initGraphEvents(graph, moteStore, renderGraph, selectNode, zoom)
 *
 * // 选中指定节点
 * selectNode(graph, 'nodeId', moteStore)
 */

import { Graph, Node } from '@antv/x6'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import insertCss from 'insert-css'
import { nextTick } from 'vue'
import { useMoteStore } from '@/stores/moteStore'

// ==================== 类型定义 ====================
/**
 * 缩放引用接口
 *
 * 用于传递缩放值的响应式引用
 */
interface ZoomRef {
  /** 缩放值 */
  value: number
}

// ==================== 事件处理函数 ====================
/**
 * 选中指定节点
 *
 * 在思维导图中选中指定ID的节点，更新选中状态并居中显示
 *
 * @param {Graph} graph - AntV X6 图形实例
 * @param {string} nodeId - 要选中的节点ID
 * @param {ReturnType<typeof useMoteStore>} moteStore - 脑图状态管理 Store
 *
 * @example
 * selectNode(graph, 'node123', moteStore)
 * // 选中ID为 node123 的节点
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
 *
 * 处理全局键盘事件，执行相应的快捷键操作
 *
 * @param {KeyboardEvent} event - 键盘事件对象
 * @param {ReturnType<typeof useMoteStore>} moteStore - 脑图状态管理 Store
 * @param {() => void} renderGraph - 重新渲染图形的函数
 * @param {(nodeId: string) => void} selectNodeFn - 选中节点的函数
 *
 * @example
 * document.addEventListener('keydown', (event) => {
 *   handleKeyDown(event, moteStore, renderGraph, selectNode)
 * })
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
 *
 * 处理鼠标滚轮事件，实现图形缩放功能
 *
 * @param {WheelEvent} e - 滚轮事件对象
 * @param {ZoomRef} zoom - 缩放值引用
 *
 * @example
 * container.addEventListener('wheel', (e) => handleWheel(e, zoom))
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
/**
 * 设置图形事件监听
 *
 * 为图形实例设置各种事件监听器，包括节点点击、空白区域点击等
 *
 * @param {Graph} graph - AntV X6 图形实例
 * @param {ReturnType<typeof useMoteStore>} moteStore - 脑图状态管理 Store
 *
 * @example
 * setupGraphEvents(graph, moteStore)
 */
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
/**
 * 初始化图形插件
 *
 * 为图形实例添加必要的插件，包括选择和键盘插件
 *
 * @param {Graph} graph - AntV X6 图形实例
 *
 * @example
 * initPlugins(graph)
 */
export const initPlugins = (graph: Graph) => {
  if (!graph) return

  graph.use(new Selection())
  graph.use(new Keyboard())
}

// ==================== 样式初始化 ====================
/**
 * 初始化图形样式
 *
 * 添加选中节点的自定义样式，包括边框和文字颜色
 *
 * @example
 * initStyles()
 */
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
/**
 * 设置滚轮事件监听
 *
 * 为容器元素添加滚轮事件监听，实现缩放功能
 *
 * @param {ZoomRef} zoom - 缩放值引用
 * @returns {() => void} 清理函数
 *
 * @example
 * const cleanup = setupWheelHandler(zoom)
 * // 在组件卸载时调用 cleanup()
 */
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
/**
 * 设置键盘事件监听
 *
 * 为文档添加键盘事件监听，处理快捷键操作
 *
 * @param {ReturnType<typeof useMoteStore>} moteStore - 脑图状态管理 Store
 * @param {() => void} renderGraph - 重新渲染图形的函数
 * @param {(nodeId: string) => void} selectNodeFn - 选中节点的函数
 * @returns {() => void} 清理函数
 *
 * @example
 * const cleanup = setupKeyboardHandler(moteStore, renderGraph, selectNode)
 * // 在组件卸载时调用 cleanup()
 */
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
/**
 * 初始化图形事件
 *
 * 统一初始化所有图形相关的事件和插件，返回清理函数
 *
 * @param {Graph} graph - AntV X6 图形实例
 * @param {ReturnType<typeof useMoteStore>} moteStore - 脑图状态管理 Store
 * @param {() => void} renderGraph - 重新渲染图形的函数
 * @param {(nodeId: string) => void} selectNodeFn - 选中节点的函数
 * @param {ZoomRef} zoom - 缩放值引用
 * @returns {() => void} 清理函数
 *
 * @example
 * const cleanup = initGraphEvents(graph, moteStore, renderGraph, selectNode, zoom)
 * // 在组件卸载时调用 cleanup()
 */
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
