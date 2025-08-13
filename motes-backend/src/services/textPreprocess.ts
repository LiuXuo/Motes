/**
 * 文本预处理服务
 * 
 * 负责对原始文本进行预处理，包括：
 * - 文本清洗和标准化
 * - 句子分割和过滤
 * - 噪声去除
 * - 长度限制
 * 
 */

/// <reference path="../types/externals.d.ts" />
import nlp from 'compromise';

/**
 * 预处理选项
 * 
 * 定义文本预处理的配置选项。
 * 
 * @interface PreprocessOptions
 */
export type PreprocessOptions = {
  /** 最大字符数限制 */
  maxChars?: number;
};

/**
 * 预处理文本
 * 
 * 对原始文本进行全面的预处理，包括清洗、分割、过滤和长度限制。
 * 使用 compromise 库进行句子层面的分割与清洗。
 * 
 * @param {string} raw - 原始文本
 * @param {PreprocessOptions} [options] - 预处理选项
 * @returns {string} 预处理后的文本
 * 
 * @example
 * const processed = preprocessText('原始文本内容...', { maxChars: 10000 });
 * console.log(processed);
 * 
 * @example
 * // 处理包含特殊字符的文本
 * const text = preprocessText('文本\u00a0内容\n\n\n换行');
 * // 输出: "文本 内容\n\n换行"
 */
export function preprocessText(raw: string, options?: PreprocessOptions): string {
  if (!raw) return '';

  // 统一换行与空白
  let text = raw.replace(/\r\n?/g, '\n').replace(/\t/g, ' ');
  text = text.replace(/\u00a0/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // 使用 compromise 做句子层面的分割与清洗
  const doc = nlp(text);
  const sentences = doc.sentences().out('array') as string[];

  const cleaned = sentences
    .map((s) => String(s || '').trim())
    // 过滤过短句
    .filter((s) => s.length >= 4)
    // 合理删除纯标点/噪声
    .filter((s) => /[\p{Letter}\p{Number}]/u.test(s));

  let result = cleaned.join('\n');
  const limit = options?.maxChars ?? 40_000;
  if (result.length > limit) {
    result = result.slice(0, limit);
  }
  return result;
}


