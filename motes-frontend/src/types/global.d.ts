declare module '@antv/hierarchy' {
  interface HierarchyOptions {
    direction?: 'H' | 'V' | 'LR' | 'RL' | 'TB' | 'BT'
    getHeight?: (data: unknown) => number
    getWidth?: (data: unknown) => number
    getHGap?: () => number
    getVGap?: () => number
    getSide?: () => 'left' | 'right' | 'top' | 'bottom'
  }

  interface AntvHierarchyResult {
    id: string
    x: number
    y: number
    data: unknown
    children?: AntvHierarchyResult[]
  }

  interface Hierarchy {
    mindmap(data: unknown, options?: HierarchyOptions): AntvHierarchyResult
  }

  const hierarchy: Hierarchy
  export default hierarchy
}

declare module 'insert-css' {
  function insertCss(css: string): void
  export default insertCss
}
