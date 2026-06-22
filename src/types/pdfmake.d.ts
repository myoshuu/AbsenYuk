declare module "pdfmake/build/pdfmake" {
  interface TCreatedPdf {
    getBuffer(callback: (buffer: Buffer) => void): void;
  }
  interface TDocumentDefinition {
    content: any[];
    styles?: Record<string, any>;
    [key: string]: any;
  }
  const pdfmake: {
    vfs: Record<string, string>;
    createPdf(doc: TDocumentDefinition): TCreatedPdf;
  };
  export default pdfmake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: { vfs: Record<string, string>; pdfMake?: { vfs: Record<string, string> } };
  export default vfs;
}
