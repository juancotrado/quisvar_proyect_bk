import { ControllerFunction } from 'types/patterns';
import GenerateFiles from '../utils/generateFile';
import { writeFileSync } from 'fs';
import tmp from 'tmp';
import AppError from '../utils/appError';

class PDFGenerateController {
  private headers(filename: string) {
    return {
      headers: {
        'Content-Disposition': `attachment; filename=convert_${filename}`,
        'Content-Type': 'application/pdf',
      },
    };
  }

  public pagesInPage: ControllerFunction = async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('archivo inexistente', 500);
      const { buffer, originalname } = req.file as Express.Multer.File;
      const options = this.headers(originalname);
      const newFile = await GenerateFiles.coverTwoPage(buffer);
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, `convert_${originalname}`, options, error => {
        if (!error) fileTemp.removeCallback();
      });
    } catch (error) {
      next(error);
    }
  };

  public pagesInCover: ControllerFunction = async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('archivo inexistente', 500);
      const { buffer, originalname } = req.file as Express.Multer.File;
      const options = this.headers(originalname);
      // outputPath: 'compress_cp/file_with_logo.pdf',
      const newFile = await GenerateFiles.cover(buffer, { brand: 'dhyrium' });
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, `convert_${originalname}`, options, error => {
        if (!error) fileTemp.removeCallback();
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PDFGenerateController;
