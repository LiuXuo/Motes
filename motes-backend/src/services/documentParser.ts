/// <reference path="../types/externals.d.ts" />
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export type ParsedDocument = {
  text: string;
  meta: {
    mimeType?: string;
    fileName?: string;
    ext?: string;
    source: 'pdf' | 'docx' | 'markdown' | 'text' | 'unknown';
  };
};

export type UploadedFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

const isPdf = (mime?: string, filename?: string) => {
  if (mime && mime.toLowerCase().includes('pdf')) return true;
  return (filename || '').toLowerCase().endsWith('.pdf');
};

const isDocx = (mime?: string, filename?: string) => {
  if (mime && mime.toLowerCase().includes('word')) return true;
  const name = (filename || '').toLowerCase();
  return name.endsWith('.docx') || name.endsWith('.doc');
};

const isMarkdown = (mime?: string, filename?: string) => {
  if (mime && (mime.includes('markdown') || mime.includes('text/markdown'))) return true;
  return (filename || '').toLowerCase().endsWith('.md');
};

export async function parseUploadedDocument(file: UploadedFile): Promise<ParsedDocument> {
  const mimeType = file.mimetype;
  const fileName = file.originalname;
  const buffer = file.buffer;

  // PDF
  if (isPdf(mimeType, fileName)) {
    const result = await pdfParse(buffer);
    return {
      text: result.text || '',
      meta: { mimeType, fileName, ext: 'pdf', source: 'pdf' },
    };
  }

  // DOCX/DOC
  if (isDocx(mimeType, fileName)) {
    const { value } = await mammoth.extractRawText({ buffer });
    return {
      text: value || '',
      meta: { mimeType, fileName, ext: 'docx', source: 'docx' },
    };
  }

  // Markdown
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


