import { ControllerFunction } from 'types/patterns';
import GenerateFiles from '../utils/generateFile';
import {
  readFile,
  stat,
  statSync,
  unlink,
  unlinkSync,
  writeFile,
  writeFileSync,
} from 'fs';
import tmp from 'tmp';
import AppError from '../utils/appError';
import crypto from 'crypto';
import { Readable } from 'stream';

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

  public sign: ControllerFunction = async (req, res, next) => {
    try {
      // if (!req.file) throw new AppError('archivo inexistente', 500);
      // const { originalname, path } = req.file as Express.Multer.File;
      const password = 'eldiegoesuncabrodemierda';
      const key = crypto.scryptSync(password, 'GfG', 24);
      const iv = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
      // const iv = Buffer.from('eldiegoesuncabrodemierdaquelegus', 'hex');
      // const iv = crypto.randomBytes(16);
      // const pathDeciper: string = await new Promise(resolve => {
      //   readFile(path, (err, data) => {
      //     if (err) throw new AppError('archivo inexistente', 500);
      //     const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
      //     const dataCipher = Buffer.concat([
      //       cipher.update(data),
      //       cipher.final(),
      //     ]);
      //     const pathEnc = path + '.enc';
      //     writeFileSync(pathEnc, dataCipher);
      //     unlinkSync(path);
      //     resolve(pathEnc);
      //   });
      // });
      const pathDeciper = 'public/signs/1710402289341$$image.png.enc';
      const bufferImage: Buffer = await new Promise(resolve => {
        readFile(pathDeciper, (err, data) => {
          const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
          const dataDeciper = Buffer.concat([
            decipher.update(data),
            decipher.final(),
          ]);
          resolve(dataDeciper);
          // writeFileSync(`public/signs/${originalname}`, dataDeciper);
        });
      });
      const imageStream = Readable.from(bufferImage);
      const filename = 'patito.png';
      res.set('Content-Type', 'image/jpeg');
      res.set('Content-Disposition', `filename="${filename}"`);
      imageStream.pipe(res);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
export default PDFGenerateController;
