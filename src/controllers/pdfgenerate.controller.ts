import { ControllerFunction } from 'types/patterns';
import GenerateFiles from '../utils/generateFile';
import { existsSync, readFile, unlinkSync, writeFileSync } from 'fs';
import tmp from 'tmp';
import AppError from '../utils/appError';
import crypto from 'crypto';
import { Readable } from 'stream';
import path, { extname } from 'path';
import { UserType } from '../middlewares/auth.middleware';
import { PickSealMessage } from 'types/types';
import { PayMailServices } from '../services';
import MailServices from '../services/mail.services';
import { ContentType } from './download.controller';
class PDFGenerateController {
  private headers(filename: string, type: keyof typeof ContentType) {
    return {
      headers: {
        'Content-Disposition': `attachment; filename=${filename}`,
        'Content-Type': ContentType[type],
      },
    };
  }

  public pagesInPage: ControllerFunction = async (req, res, next) => {
    try {
      const url = req.query.url as string;
      let originalName: string;
      let Buffer: Buffer | string;
      if (url) {
        const name = req.query.fileName as string;
        Buffer = url;
        originalName = name || '';
      } else {
        if (!req.file) throw new AppError('archivo inexistente', 500);
        const { buffer, originalname } = req.file as Express.Multer.File;
        Buffer = buffer;
        originalName = originalname;
      }
      const newFile = await GenerateFiles.coverTwoPage(Buffer);
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      const options = this.headers(originalName, 'PDF');
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, `convert_${originalName}`, options, error => {
        if (!error) fileTemp.removeCallback();
      });
    } catch (error) {
      next(error);
    }
  };

  public pageWithCoverV2: ControllerFunction = async (req, res, next) => {
    try {
      const { title, filename } = req.body;
      const newFile = await GenerateFiles.coverV2(title, undefined, {});
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      const options = this.headers(filename, 'PDF');
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, filename, options, error => {
        if (!error) fileTemp.removeCallback();
      });
    } catch (error) {
      next(error);
    }
  };

  public pagesInSeal: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const data = JSON.parse(body.data) as Omit<
        PickSealMessage,
        'paymessageId'
      >;
      //----------------------------------------------------------------
      const findMessage = await PayMailServices.getMessageShort(+id);
      //----------------------------------------------------------------
      const { name, path } = findMessage.files[0];
      const destinityFile = path + '/' + name;
      // const url = req.query.url as string;
      let originalName: string;
      let Buffer: Buffer | string;
      if (destinityFile) {
        const name = req.query.fileName as string;
        Buffer = destinityFile;
        originalName = name || '';
      } else {
        if (!req.file) throw new AppError('archivo inexistente', 500);
        const { buffer, originalname } = req.file as Express.Multer.File;
        Buffer = buffer;
        originalName = originalname;
      }
      //----------------------------------------------------------------
      const quantitySeal = data.numberPage ? +data.numberPage : 0;
      const positionSeal = findMessage.positionSeal;
      const dateSeal = new Date().toISOString().split('T')[0];
      const parseDateSeal = dateSeal.split('-').reverse().join('-');
      const newFile = await GenerateFiles.coverFirma(Buffer, undefined, {
        date: parseDateSeal,
        numberPage: quantitySeal,
        pos: positionSeal,
        to: data.to,
        observation: data.observations,
        title: findMessage.office?.name,
      });
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      const options = this.headers(originalName, 'PDF');
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, `convert_${originalName}`, options, error => {
        if (!error) fileTemp.removeCallback();
      });
    } catch (error) {
      next(error);
    }
  };
  public pagesInSealMail: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const data = JSON.parse(body.data) as Omit<
        PickSealMessage,
        'paymessageId' | 'messageId'
      >;
      //----------------------------------------------------------------
      const findMessage = await MailServices.getMessageShort(+id);
      //----------------------------------------------------------------
      const { name, path } = findMessage.files[0];
      const destinityFile = path + '/' + name;
      // const url = req.query.url as string;
      let originalName: string;
      let Buffer: Buffer | string;
      if (destinityFile) {
        const name = req.query.fileName as string;
        Buffer = destinityFile;
        originalName = name || '';
      } else {
        if (!req.file) throw new AppError('archivo inexistente', 500);
        const { buffer, originalname } = req.file as Express.Multer.File;
        Buffer = buffer;
        originalName = originalname;
      }
      //----------------------------------------------------------------
      const quantitySeal = data.numberPage ? +data.numberPage : 0;
      const positionSeal = findMessage.positionSeal;
      const dateSeal = new Date().toISOString().split('T')[0];
      const parseDateSeal = dateSeal.split('-').reverse().join('-');
      const newFile = await GenerateFiles.coverFirma(Buffer, undefined, {
        date: parseDateSeal,
        numberPage: quantitySeal,
        pos: positionSeal,
        to: data.to,
        observation: data.observations,
        title: findMessage.office?.name,
      });
      const fileTemp = tmp.fileSync({ postfix: '.pdf' });
      const options = this.headers(originalName, 'PDF');
      writeFileSync(fileTemp.name, newFile);
      res.download(fileTemp.name, `convert_${originalName}`, options, error => {
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
      const options = this.headers(originalname, 'PDF');
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
      const { path: filePath, destination } = req.file as Express.Multer.File;
      const { IV, SECRET_CODE } = res.locals as Record<string, string>;
      const { profile }: UserType = res.locals.userInfo;
      const extension = extname(filePath);
      const pathEnc = path.join(destination, profile.dni + extension + '.key');
      if (existsSync(pathEnc)) {
        unlinkSync(filePath);
        throw new AppError('Firma encriptada anteriormente', 500);
      }
      const key = crypto.scryptSync(SECRET_CODE, 'GfG', 24);
      const iv = Buffer.from(IV, 'hex');
      await new Promise(resolve => {
        readFile(filePath, (err, data) => {
          if (err) throw new AppError('archivo inexistente', 500);
          const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
          const dataCipher = Buffer.concat([
            cipher.update(data),
            cipher.final(),
          ]);
          writeFileSync(pathEnc, dataCipher);
          unlinkSync(filePath);
          resolve(pathEnc);
        });
      });
      res.status(201).json({ message: 'Firma encriptada con exito' });
    } catch (error) {
      next(error);
    }
  };

  public decrypt: ControllerFunction = async (req, res, next) => {
    try {
      const { IV, SECRET_CODE } = res.locals as Record<string, string>;
      if (!IV || !SECRET_CODE)
        throw new AppError('error en claves secretas', 500);
      const { dni: id } = req.params;
      const type = req.query.type as '64' | 'BLOB' | undefined;
      const key = crypto.scryptSync(SECRET_CODE, 'GfG', 24);
      const iv = Buffer.from(IV, 'hex');
      const pathDeciper = path.join('public/signs', id + '.png' + '.key');
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
      if (type === '64') {
        const imageStream = bufferImage.toString('base64');
        res.send(imageStream);
      } else {
        const imageStream = Readable.from(bufferImage);
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', `filename="image.png"`);
        imageStream.pipe(res);
      }
    } catch (error) {
      next(error);
    }
  };

  public removeSign: ControllerFunction = async (req, res, next) => {
    try {
      const { profile }: UserType = res.locals.userInfo;
      const pathEnc = path.join('public/signs', profile.dni + '.png.key');
      if (!existsSync(pathEnc))
        throw new AppError(`no se pudo eliminar, firma inexistente`, 500);
      unlinkSync(pathEnc);
      res.status(200).json({ message: 'Firma eliminada con éxito' });
    } catch (error) {
      next(error);
    }
  };
}
export default PDFGenerateController;
