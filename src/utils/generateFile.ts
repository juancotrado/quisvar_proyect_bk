import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import PDFDocumentKit from 'pdfkit';
import AppError from './appError';
import { PDFDocument } from 'pdf-lib';
class GenerateFiles {
  static cover(text: string, outputPath: string, imagePath: string) {
    const margin = 10;
    const doc = new PDFDocumentKit({ margin });
    //--------------------------------------------------------------------------
    const height = doc.page.height - margin * 2;
    const width = doc.page.width - margin * 2;
    doc.opacity(0.5);
    doc.image(imagePath, { height, width, align: 'center' });
    doc.opacity(1);
    const titleHeight = text.length > 70 ? 230 : 300;
    doc.fontSize(50).text(text, 40, titleHeight, { align: 'center' });
    //--------------------------------------------------------------------------
    const stream = createWriteStream(outputPath);
    doc.pipe(stream);
    doc.end();
    stream.on('error', () => {
      throw new AppError('Error al crear archivo pdf', 500);
    });
  }

  static async coverTwoPage(filePath: string | Buffer, outputPath?: string) {
    const pdfBytes: Buffer =
      typeof filePath !== 'string' ? filePath : readFileSync(filePath);
    const originalPDF = await PDFDocument.load(pdfBytes);
    const numberPages = originalPDF.getPageCount();
    const newPdfGenerate = await PDFDocument.create();
    const pageSize = [841.89, 595.28] as [number, number];
    for (let i = 0; i < numberPages; i++) {
      const newPage = newPdfGenerate.addPage(pageSize);
      const height = newPage.getHeight();
      const width = newPage.getWidth() / 2;
      try {
        const page = originalPDF.getPage(i);
        const contentPage = await newPdfGenerate.embedPage(page);
        newPage.drawPage(contentPage, { x: 0, y: 0, width, height });
        newPage.drawPage(contentPage, { x: width, y: 0, width, height });
      } catch (error) {
        newPage.drawRectangle({ x: 0, y: 0, width: width * 2, height });
      }
    }
    const pdfWithBytes = await newPdfGenerate.save();
    if (outputPath && outputPath.length > 0)
      writeFileSync(outputPath, pdfWithBytes);
    return pdfWithBytes;
  }

  static async coverFirma(
    filePath: string,
    outputPath: string,
    imagePath: string
  ) {
    const pdfBytes = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numberPages = pdfDoc.getPageCount();
    const image = await pdfDoc.embedJpg(readFileSync(imagePath));
    const page = pdfDoc.getPage(numberPages - 1);
    page.drawImage(image, { x: 100, y: 100, width: 100, height: 100 });
    const modifiedPdfBytes = await pdfDoc.save();
    writeFileSync(outputPath, modifiedPdfBytes);
  }

  static async merge(pdfPaths: string[], outputPath: string) {
    const mergedDoc = await PDFDocument.create();
    await Promise.all(
      pdfPaths.map(async pdfPath => {
        const pdfBytes = readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = await mergedDoc.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach(page => {
          mergedDoc.addPage(page);
        });
      })
    );
    const mergedBytes = await mergedDoc.save();
    writeFileSync(outputPath, mergedBytes);
  }
}

export default GenerateFiles;
