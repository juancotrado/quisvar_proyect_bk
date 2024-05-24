import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import PDFDocumentKit from 'pdfkit';
import AppError from './appError';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
  PageSizes,
} from 'pdf-lib';
import { configurationSealPDF } from 'types/types';
import path from 'path';

interface CoverV2Options {
  margin?: number;
  fontSize?: number;
  sizePage?: keyof typeof PageSizes;
}

class GenerateFiles {
  public static async coverV2(
    // filePath: string | Buffer,
    text: string,
    outputPath: string | undefined,
    options: CoverV2Options
  ) {
    // const pdfBytes: Buffer =
    //   typeof filePath !== 'string' ? filePath : readFileSync(filePath);
    const { fontSize = 50, margin = 20, sizePage = 'A4' } = options;
    const newPdfGenerate = await PDFDocument.create();
    const pageSize = PageSizes[sizePage];
    const newPage = newPdfGenerate.addPage(pageSize);

    //-------------------------------------------------------------------------
    const font = await newPdfGenerate.embedFont(StandardFonts.HelveticaBold);
    const size = fontSize;
    const { width, height } = newPage.getSize();
    const maxWidth = width - margin;
    const color = rgb(0, 0, 0);
    const words = text.split(' ');
    const usableWidth = width - 2 * margin;
    const usableHeight = height - 2 * margin;
    //-------------------------------------------------------------------------
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine ? currentLine + ' ' + word : word;
      let testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth < usableWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const totalTextHeight = lines.length * (fontSize + 5);
    let y = height - margin - (usableHeight - totalTextHeight) / 2;

    for (let line of lines) {
      let lineWidth = font.widthOfTextAtSize(line, fontSize);
      let x = margin + (usableWidth - lineWidth) / 2;
      newPage.drawText(line, { x, y, size, font, maxWidth, color });
      y -= fontSize + 5;
    }

    const modifiedPdfBytes = await newPdfGenerate.save();
    if (outputPath && outputPath.length > 0)
      writeFileSync(outputPath, modifiedPdfBytes);
    return modifiedPdfBytes;
  }

  public static coverInLevel(
    text: string,
    outputPath: string,
    imagePath: string
  ) {
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

  public static async cover(
    filePath: string | Buffer,
    {
      imagePath,
      outputPath,
      brand,
    }: { imagePath?: string; brand?: string; outputPath?: string }
  ) {
    const pdfBytes: Buffer =
      typeof filePath !== 'string' ? filePath : readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numberPages = pdfDoc.getPageCount();
    // const newPdfGenerate = await PDFDocument.create();
    // const newPage = newPdfGenerate.addPage(PageSizes.A4);
    const pathBrand = path.join('resource', `${brand}`, `${brand}_logo.png`);
    const pathHeader = path.join('resource', `${brand}`, `${brand}_header.png`);
    const pathFooter = path.join('resource', `${brand}`, `${brand}_footer.png`);

    const image = await pdfDoc.embedPng(
      readFileSync(imagePath ? imagePath : pathBrand)
    );
    const footer = brand && (await pdfDoc.embedPng(readFileSync(pathFooter)));
    const header = brand && (await pdfDoc.embedPng(readFileSync(pathHeader)));
    for (let i = 0; i < numberPages; i++) {
      const page = pdfDoc.getPage(i);
      page.drawImage(image, {
        x: page.getWidth() / 4,
        y: page.getHeight() / 3,
        width: page.getWidth() / 2,
        height: page.getHeight() / 3,
        opacity: 0.2,
      });
      if (header && footer) {
        page.drawImage(header, {
          x: 0,
          y: page.getHeight() - 80,
          width: page.getWidth(),
          height: 80,
        });
        page.drawImage(footer, {
          x: 0,
          y: -10,
          width: page.getWidth(),
          height: 100,
        });
      }
    }
    //------------------------------------------------------------
    const pdfWithBytes = await pdfDoc.save();
    if (outputPath && outputPath.length > 0)
      writeFileSync(outputPath, pdfWithBytes);
    return pdfWithBytes;
  }

  public static async coverTwoPage(
    filePath: string | Buffer,
    outputPath?: string
  ) {
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

  public static async coverFirma(
    filePath: string | Buffer,
    outputPath: string | undefined,
    { pos, ...data }: Omit<configurationSealPDF, 'x' | 'y'> & { pos: number } // imagePath: string
  ) {
    const pdfBytes: Buffer =
      typeof filePath !== 'string' ? filePath : readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numberPages = pdfDoc.getPageCount();
    // const image = await pdfDoc.embedJpg(readFileSync(imagePath));
    const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const page = pdfDoc.getPage(numberPages - 1);
    const sealdWidth = page.getWidth() / 3;
    const generateCoordsX = [10, sealdWidth + 5, sealdWidth * 2];
    const generateCoordsY = new Array(6).fill(10).map((v, i) => v + 135 * i);
    //-------------------------------------------------------------------------
    const getCoords = (value: number) => {
      const coordX = value % 3 !== 0 ? (value % 3) - 1 : 2;
      const coordY = value % 3 !== 0 ? Math.floor(value / 3) : value / 3 - 1;
      if (value <= 0 || value > 18) return { x: 10, y: 10 };
      return { x: generateCoordsX[coordX], y: generateCoordsY[coordY] };
    };
    //-------------------------------------------------------------------------
    const position = getCoords(pos);
    // maxlength_obs = 88
    // maxlength_title = 16
    // maxlength_to = 50
    GenerateFiles.drawSeil(page, font, {
      x: position.x,
      y: position.y,
      date: data.date,
      numberPage: data.numberPage,
      to: data.to,
      observation: data.observation,
      title: data.title,
    });

    const modifiedPdfBytes = await pdfDoc.save();
    if (outputPath && outputPath.length > 0)
      writeFileSync(outputPath, modifiedPdfBytes);
    return modifiedPdfBytes;
  }

  public static async merge(pdfPaths: string[], outputPath: string) {
    const mergedDoc = await PDFDocument.create();
    const batchSize = 10;
    const loadPages = async (pdfPath: string) => {
      const pdfBytes = readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => {
        mergedDoc.addPage(page);
      });
    };

    for (let i = 0; i < pdfPaths.length; i += batchSize) {
      const batch = pdfPaths.slice(i, i + batchSize);
      const tasks = batch.map(async pdfPath => await loadPages(pdfPath));
      await Promise.all(tasks);
    }

    const mergedBytes = await mergedDoc.save();
    writeFileSync(outputPath, mergedBytes);
    return outputPath;
  }

  public static async drawSeil(
    page: PDFPage,
    font: PDFFont,
    { x, y, date, to, observation, numberPage, title }: configurationSealPDF
  ) {
    const lineHeight = 15;
    page.drawRectangle({
      x,
      y,
      width: page.getWidth() / 3 - 10,
      height: 120,
      borderWidth: 2,
      borderColor: rgb(0, 0, 0.7),
      borderOpacity: 0.9,
      opacity: 0.6,
      color: rgb(0.98, 0.98, 0.98),
    });
    page.drawRectangle({
      x: x + 5,
      y: y + 5,
      width: page.getWidth() / 3 - 20,
      height: 120 - 10,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0.7),
      borderDashArray: [3, 4],
      opacity: 0,
    });
    page.setFontSize(9.5);
    page.setFont(font);
    page.setFontColor(rgb(0, 0, 0.7));
    page.drawText(
      `PROVEIDO ${title?.toUpperCase()} CORPORACIÓN DHYRIUM S.A.C`,
      {
        x: x + 15,
        y: y + 50 + lineHeight * 3 + 8,
        lineHeight: 10,
        maxWidth: page.getWidth() / 3 - 20,
      }
    );
    // page.drawText(`CORPORACIÓN DHYRIUM S.A.C`, {
    //   x: x + 15,
    //   y: y + 50 + lineHeight * 3 - 2,
    // });
    page.setFontSize(9.5);
    page.drawText(`Fecha:${date}`, {
      x: x + 15,
      y: y + 50 + lineHeight * 2,
    });
    page.drawText(`N°:${numberPage.toString().padStart(4, '0')}`, {
      x: x + 130,
      y: y + 50 + lineHeight * 2,
    });
    page.drawText(`Para:${to}`, {
      x: x + 15,
      y: y + 50 + lineHeight,
      lineHeight: 12,
      maxWidth: page.getWidth() / 3 - 30,
    });
    const responsiveHeightFromTo =
      to.length > 24 ? y + 50 - lineHeight + 5 : y + 50 - lineHeight + 15;
    page.setFontSize(10);
    page.drawText('Observaciones:', {
      x: x + 15,
      y: responsiveHeightFromTo,
      lineHeight: 10,
    });
    page.setFontSize(8);
    page.drawText(`${observation}`, {
      x: x + 15,
      y: responsiveHeightFromTo - 10,
      maxWidth: page.getWidth() / 3 - 22,
      lineHeight: 10,
    });
  }
}

export default GenerateFiles;
