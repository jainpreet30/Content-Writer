declare module 'html-docx-js/dist/html-docx' {
  interface ConvertOptions {
    orientation?: 'portrait' | 'landscape';
    margins?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  }
  const htmlDocx: {
    asBlob(html: string, options?: ConvertOptions): Blob;
  };
  export default htmlDocx;
  export function asBlob(html: string, options?: ConvertOptions): Blob;
}
