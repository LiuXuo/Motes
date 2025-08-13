/**
 * 外部模块类型定义文件
 * 
 * 为第三方库提供 TypeScript 类型定义，包括：
 * - PDF 解析库
 * - Word 文档解析库
 * - 自然语言处理库
 * 
 */

/**
 * PDF 解析模块类型定义
 * 
 * 为 pdf-parse 库提供类型支持，用于解析 PDF 文件内容
 */
declare module 'pdf-parse' {
  /** PDF 解析结果数据结构 */
  type PDFData = { 
    /** 提取的文本内容 */
    text: string 
  };
  
  /**
   * PDF 解析函数
   * 
   * @param {Buffer} buffer - PDF 文件的二进制数据
   * @returns {Promise<PDFData>} 解析后的文本数据
   */
  function pdf(buffer: Buffer): Promise<PDFData>;
  
  export default pdf;
}

/**
 * Word 文档解析模块类型定义
 * 
 * 为 mammoth 库提供类型支持，用于解析 .docx 文件内容
 */
declare module 'mammoth' {
  /**
   * 提取 Word 文档原始文本
   * 
   * @param {Object} input - 输入对象
   * @param {Buffer} input.buffer - Word 文档的二进制数据
   * @returns {Promise<{value: string}>} 解析后的文本数据
   */
  export function extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>;
  
  /** 默认导出对象 */
  const defaultExport: { extractRawText: typeof extractRawText };
  export default defaultExport;
}

/**
 * 自然语言处理模块类型定义
 * 
 * 为 compromise 库提供类型支持，用于文本分析和处理
 */
declare module 'compromise' {
  /** 文档对象类型 */
  export type Doc = {
    /**
     * 获取句子列表
     * 
     * @returns {Object} 句子处理对象
     * @returns {Function} sentences().out - 输出格式化函数
     */
    sentences(): { out: (fmt: 'array') => string[] };
  };
  
  /**
   * 自然语言处理函数
   * 
   * @param {string} text - 待处理的文本
   * @returns {Doc} 文档对象，用于进一步处理
   */
  function nlp(text: string): Doc;
  
  export default nlp;
}
