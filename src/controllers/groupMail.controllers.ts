import { ControllerFunction } from 'types/patterns';
import { ParametersMail, PickMail } from 'types/types';
import { UserType } from '../middlewares/auth.middleware';
import MailServices from '../services/mail.services';
import { Messages } from '@prisma/client';
import AppError from '../utils/appError';
import { existsSync, mkdirSync, renameSync } from 'fs';

class GroupMailControllers {
  private static category: Messages['category'] = 'GLOBAL';
  private static attempt: string = `${new Date().getTime()}`;

  public static showMesssages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip, ...params } = req.query as ParametersMail;
      const { id: userId }: UserType = res.locals.userInfo;
      const newParams = { skip, ...params };
      const query = await MailServices.getByUser(
        userId,
        this.category,
        newParams
      );
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static showMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: messageId } = req.params;
      const query = await MailServices.getMessage(+messageId);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static createMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { data: info } = req.body;
      const data = JSON.parse(info) as PickMail;
      //--------------------------------------------------------------------------
      if (!req.files) throw new AppError('No se pudo subir los archivos', 400);
      const files = req.files as Express.Multer.File[];
      const path = 'public/mail/' + senderId;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      const parseFiles = files.map(({ filename: name, path: filePath }) => {
        const newFileName = path + '/' + name;
        renameSync(filePath, newFileName);
        return { name, path, attempt: this.attempt };
      });
      //--------------------------------------------------------------------------
      const query = await MailServices.create(
        { ...data, senderId },
        this.category,
        parseFiles
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export default GroupMailControllers;
