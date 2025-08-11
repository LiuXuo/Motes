/// <reference path="../types/externals.d.ts" />
import nlp from 'compromise';

export type PreprocessOptions = {
  maxChars?: number;
};

// 基础清洗 + 句子切分 + 过滤噪声
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


