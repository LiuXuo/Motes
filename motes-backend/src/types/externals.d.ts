declare module 'pdf-parse' {
  type PDFData = { text: string };
  function pdf(buffer: Buffer): Promise<PDFData>;
  export default pdf;
}

declare module 'mammoth' {
  export function extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>;
  const defaultExport: { extractRawText: typeof extractRawText };
  export default defaultExport;
}

declare module 'compromise' {
  export type Doc = {
    sentences(): { out: (fmt: 'array') => string[] };
  };
  function nlp(text: string): Doc;
  export default nlp;
}
