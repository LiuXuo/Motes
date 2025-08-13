/**
 * 大纲笔记滚动工具函数
 *
 * 提供大纲笔记视图的滚动功能，包括：
 * - 滚动到指定节点
 * - 平滑滚动动画
 * - 居中显示选中节点
 *
 * @module useNoteScroll
 * @example
 * import { useNoteScroll } from './useNoteScroll'
 *
 * const { scrollToCenter } = useNoteScroll()
 * scrollToCenter('nodeId')
 */

import { nextTick } from 'vue'

// ==================== 滚动工具函数 ====================
/**
 * 大纲笔记滚动工具函数
 *
 * 提供滚动到指定节点的功能，支持平滑滚动和居中显示
 *
 * @returns {object} 包含滚动函数的对象
 *
 * @example
 * const { scrollToCenter } = useNoteScroll()
 * scrollToCenter('node123')
 */
export const useNoteScroll = () => {
  /**
   * 滚动到中心功能
   *
   * 将指定节点滚动到容器中心位置，支持平滑滚动动画
   *
   * @param {string} nodeId - 要滚动到的节点ID
   *
   * @example
   * scrollToCenter('node123')
   * // 将ID为 node123 的节点滚动到中心
   */
  const scrollToCenter = (nodeId: string) => {
    nextTick(() => {
      const selectedElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      const container = document.querySelector('.outline-container') as HTMLElement

      if (selectedElement && container) {
        const containerRect = container.getBoundingClientRect()
        const elementRect = selectedElement.getBoundingClientRect()
        const containerCenter = containerRect.height / 2
        const elementCenter = (elementRect.top + elementRect.bottom) / 2 - containerRect.top
        const scrollDistance = elementCenter - containerCenter

        container.scrollBy({
          top: scrollDistance,
          behavior: 'smooth',
        })
      }
    })
  }

  return {
    scrollToCenter,
  }
}
