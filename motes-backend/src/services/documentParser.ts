/**
 * 文档解析服务
 * 
 * 负责解析上传的文档文件，支持多种格式：
 * - PDF 文档解析
 * - Word 文档 (DOCX/DOC) 解析
 * - Markdown 文件解析
 * - 纯文本文件解析
 * 
 */

/// <reference path="../types/externals.d.ts" />
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

/**
 * 解析后的文档数据
 * 
 * 包含文档的文本内容和元数据信息。
 * 
 * @interface ParsedDocument
 */
export type ParsedDocument = {
  /** 解析后的文本内容 */
  text: string;
  /** 文档元数据 */
  meta: {
    /** MIME 类型 */
    mimeType?: string;
    /** 原始文件名 */
    fileName?: string;
    /** 文件扩展名 */
    ext?: string;
    /** 文档来源类型 */
    source: 'pdf' | 'docx' | 'markdown' | 'text' | 'unknown';
  };
};

/**
 * 上传的文件数据
 * 
 * 包含文件的基本信息和二进制数据。
 * 
 * @interface UploadedFile
 */
export type UploadedFile = {
  /** MIME 类型 */
  mimetype: string;
  /** 原始文件名 */
  originalname: string;
  /** 文件二进制数据 */
  buffer: Buffer;
};

/**
 * 检查是否为 PDF 文件
 * 
 * 通过 MIME 类型或文件扩展名判断是否为 PDF 文件。
 * 
 * @param {string} [mime] - MIME 类型
 * @param {string} [filename] - 文件名
 * @returns {boolean} 是否为 PDF 文件
 * 
 * @private
 * 
 * @example
 * const isPdfFile = isPdf('application/pdf', 'document.pdf');
 * // 返回: true
 */
const isPdf = (mime?: string, filename?: string) => {
  if (mime && mime.toLowerCase().includes('pdf')) return true;
  return (filename || '').toLowerCase().endsWith('.pdf');
};

/**
 * 检查是否为 Word 文档
 * 
 * 通过 MIME 类型或文件扩展名判断是否为 Word 文档。
 * 
 * @param {string} [mime] - MIME 类型
 * @param {string} [filename] - 文件名
 * @returns {boolean} 是否为 Word 文档
 * 
 * @private
 * 
 * @example
 * const isWordFile = isDocx('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document.docx');
 * // 返回: true
 */
const isDocx = (mime?: string, filename?: string) => {
  if (mime && mime.toLowerCase().includes('word')) return true;
  const name = (filename || '').toLowerCase();
  return name.endsWith('.docx') || name.endsWith('.doc');
};

/**
 * 检查是否为 Markdown 文件
 * 
 * 通过 MIME 类型或文件扩展名判断是否为 Markdown 文件。
 * 
 * @param {string} [mime] - MIME 类型
 * @param {string} [filename] - 文件名
 * @returns {boolean} 是否为 Markdown 文件
 * 
 * @private
 * 
 * @example
 * const isMdFile = isMarkdown('text/markdown', 'readme.md');
 * // 返回: true
 */
const isMarkdown = (mime?: string, filename?: string) => {
  if (mime && (mime.includes('markdown') || mime.includes('text/markdown'))) return true;
  return (filename || '').toLowerCase().endsWith('.md');
};

/**
 * 解析上传的文档
 * 
 * 根据文件类型自动选择合适的解析器，提取文档中的文本内容。
 * 支持 PDF、Word、Markdown 和纯文本格式。
 * 
 * @param {UploadedFile} file - 上传的文件对象
 * @returns {Promise<ParsedDocument>} 解析后的文档数据
 * 
 * @throws {Error} 当解析失败时（PDF 解析失败会返回空内容而不是抛出错误）
 * 
 * @example
 * const parsedDoc = await parseUploadedDocument({
 *   mimetype: 'application/pdf',
 *   originalname: 'document.pdf',
 *   buffer: fileBuffer
 * });
 * console.log(parsedDoc.text); // 输出解析后的文本
 * console.log(parsedDoc.meta.source); // 输出: 'pdf'
 */
export async function parseUploadedDocument(file: UploadedFile): Promise<ParsedDocument> {
  const mimeType = file.mimetype;
  const fileName = file.originalname;
  const buffer = file.buffer;

  // PDF 文档解析
  if (isPdf(mimeType, fileName)) {
    try {
      const result = await pdfParse(buffer);
      return {
        text: result.text || '',
        meta: { mimeType, fileName, ext: 'pdf', source: 'pdf' },
      };
    } catch (error) {
      console.error('PDF解析失败:', error);
      // 如果PDF解析失败，返回空内容而不是抛出错误
      return {
        text: '',
        meta: { mimeType, fileName, ext: 'pdf', source: 'pdf' },
      };
    }
  }

  // Word 文档解析
  if (isDocx(mimeType, fileName)) {
    const { value } = await mammoth.extractRawText({ buffer });
    return {
      text: value || '',
      meta: { mimeType, fileName, ext: 'docx', source: 'docx' },
    };
  }

  // Markdown 文件解析
  if (isMarkdown(mimeType, fileName)) {
    const text = buffer.toString('utf8');
    return {
      text,
      meta: { mimeType, fileName, ext: 'md', source: 'markdown' },
    };
  }

  // 其他文本类型尝试直接读取
  if (mimeType && mimeType.startsWith('text/')) {
    const text = buffer.toString('utf8');
    return {
      text,
      meta: { mimeType, fileName, source: 'text' },
    };
  }

  // 回退：当作二进制未知类型
  return {
    text: '',
    meta: { mimeType, fileName, source: 'unknown' },
  };
}


