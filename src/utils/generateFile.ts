import { createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';
import AppError from './appError';
class GenerateFiles {
  static cover(text: string, outputPath: string, imagePath: string) {
    const margin = 10;
    const doc = new PDFDocument({ margin });
    //--------------------------------------------------------------------------
    doc.opacity(0.5);
    doc.image(imagePath, {
      height: doc.page.height - margin * 2,
      width: doc.page.width - margin * 2,
      align: 'center',
    });
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
}

export default GenerateFiles;
