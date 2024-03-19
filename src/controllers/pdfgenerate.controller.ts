import { ControllerFunction } from 'types/patterns';
import GenerateFiles from '../utils/generateFile';
import {
  existsSync,
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
import path from 'path';
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

  public crypt: ControllerFunction = async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('archivo inexistente', 500);
      if (!process.env.IV || !process.env.SECRET_CODE)
        throw new AppError('invalid IV or SECRET CODE', 500);
      const { originalname, filename, path } = req.file as Express.Multer.File;
      console.log(filename);
      const password = 'eldiegoesuncabrodemierda';
      const key = crypto.scryptSync(password, 'GfG', 24);
      const iv = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
      // const iv = Buffer.from('eldiegoesuncabrodemierdaquelegus', 'hex');
      // const iv = crypto.randomBytes(16);
      const pathDeciper: string = await new Promise(resolve => {
        readFile(path, (err, data) => {
          if (err) throw new AppError('archivo inexistente', 500);
          const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
          const dataCipher = Buffer.concat([
            cipher.update(data),
            cipher.final(),
          ]);
          const pathEnc = path + '.enc';
          writeFileSync(pathEnc, dataCipher);
          unlinkSync(path);
          resolve(pathEnc);
        });
      });
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
      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', `filename="${originalname}"`);
      imageStream.pipe(res);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public decrypt: ControllerFunction = async (req, res, next) => {
    try {
      const { IV, SECRET_CODE } = res.locals as Record<string, string>;
      if (!IV || !SECRET_CODE)
        throw new AppError('error en claves secretas', 500);
      const { id } = req.params;
      const key = crypto.scryptSync(SECRET_CODE, 'GfG', 24);
      const iv = Buffer.from(IV, 'hex');
      const pathDeciper = path.join('sings', id, '.enc');
      if (!existsSync(pathDeciper))
        throw new AppError(`no existe la ruta: ${pathDeciper}`, 500);
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
      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', `filename="image.png"`);
      imageStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}
export default PDFGenerateController;
