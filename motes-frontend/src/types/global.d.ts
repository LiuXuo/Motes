/**
 * Motes 前端全局类型定义文件
 *
 * 主要功能：
 * - 声明第三方库的类型定义
 * - 扩展全局类型接口
 * - 提供应用级别的类型支持
 *
 * 包含的模块：
 * - @antv/hierarchy: 思维导图布局算法库
 * - insert-css: CSS 注入工具库
 *
 * @file global.d.ts
 * @description 全局类型声明文件
 */

/**
 * @antv/hierarchy 模块类型声明
 *
 * 为思维导图布局算法库提供 TypeScript 类型支持，
 * 包括布局选项、结果数据结构等。
 *
 * @module '@antv/hierarchy'
 */
declare module '@antv/hierarchy' {
  /**
   * 层次布局选项接口
   *
   * 定义思维导图布局的各种配置选项，
   * 包括方向、尺寸、间距等参数。
   *
   * @interface HierarchyOptions
   */
  interface HierarchyOptions {
    /** 布局方向：H(水平) | V(垂直) | LR(左到右) | RL(右到左) | TB(上到下) | BT(下到上) */
    direction?: 'H' | 'V' | 'LR' | 'RL' | 'TB' | 'BT'

    /** 获取节点高度的函数 */
    getHeight?: (data: unknown) => number

    /** 获取节点宽度的函数 */
    getWidth?: (data: unknown) => number

    /** 获取水平间距的函数 */
    getHGap?: () => number

    /** 获取垂直间距的函数 */
    getVGap?: () => number

    /** 获取子节点位置的函数 */
    getSide?: () => 'left' | 'right' | 'top' | 'bottom'
  }

  /**
   * 层次布局结果接口
   *
   * 定义布局算法返回的节点数据结构，
   * 包含位置信息和子节点关系。
   *
   * @interface AntvHierarchyResult
   */
  interface AntvHierarchyResult {
    /** 节点唯一标识符 */
    id: string

    /** 节点 X 坐标 */
    x: number

    /** 节点 Y 坐标 */
    y: number

    /** 节点原始数据 */
    data: unknown

    /** 子节点数组，可选 */
    children?: AntvHierarchyResult[]
  }

  /**
   * 层次布局接口
   *
   * 定义布局算法的主要方法，
   * 提供思维导图布局功能。
   *
   * @interface Hierarchy
   */
  interface Hierarchy {
    /**
     * 思维导图布局方法
     *
     * 根据数据和选项生成思维导图的布局结构，
     * 返回包含位置信息的节点树。
     *
     * @param {unknown} data - 输入数据
     * @param {HierarchyOptions} options - 布局选项
     * @returns {AntvHierarchyResult} 布局结果
     */
    mindmap(data: unknown, options?: HierarchyOptions): AntvHierarchyResult
  }

  /** 层次布局实例 */
  const hierarchy: Hierarchy
  export default hierarchy
}

/**
 * insert-css 模块类型声明
 *
 * 为 CSS 注入工具库提供 TypeScript 类型支持，
 * 用于动态插入 CSS 样式。
 *
 * @module 'insert-css'
 */
declare module 'insert-css' {
  /**
   * CSS 注入函数
   *
   * 将 CSS 字符串动态插入到页面中，
   * 用于运行时样式管理。
   *
   * @param {string} css - 要插入的 CSS 字符串
   * @returns {void}
   *
   * @example
   * import insertCss from 'insert-css'
   * insertCss('.custom-style { color: red; }')
   */
  function insertCss(css: string): void
  export default insertCss
}
