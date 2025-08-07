import { nextTick } from 'vue'

// ==================== 滚动工具函数 ====================
export const useNoteScroll = () => {
  // 滚动到中心功能
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
