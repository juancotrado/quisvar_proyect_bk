import { PayMailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import {
  CategoryMailType,
  ParametersMail,
  PickMail,
  PickMessageReply,
} from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { ControllerFunction } from 'types/patterns';
import MailServices from '../services/mail.services';

export class MailControllers {
  private attempt = `${new Date().getTime()}`;

  public showMessages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip, ...params } = req.query as ParametersMail;
      const category = req.body.category as CategoryMailType;
      const { id: userId }: UserType = res.locals.userInfo;
      const newParams = { skip, ...params };
      const query = await MailServices.getByUser(userId, category, newParams);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: messageId } = req.params;
      const query = await MailServices.getMessage(+messageId);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      //--------------------------------------------------------------------------
      const category = req.body.category as CategoryMailType;
      if (!['GLOBAL', 'DIRECT'].includes(category))
        throw new AppError('Ingresar Valores válidos en categoria', 400);
      //--------------------------------------------------------------------------
      const path = `public/mail/${senderId}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      //--------------------------------------------------------------------------
      if (!req.files)
        throw new AppError('Oops!, no se pudo subir los archivos', 400);
      const files = req.files as Express.Multer.File[];
      const parseFiles = files.map(({ filename: name, ...file }) => {
        renameSync(file.path, path + '/' + name);
        return { name, path, attempt: this.attempt };
      });
      //--------------------------------------------------------------------------
      const data = JSON.parse(req.body.data) as Omit<PickMail, 'id'>;
      //--------------------------------------------------------------------------
      const query = await MailServices.create(
        { ...data, senderId },
        category,
        parseFiles
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createReplyMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: messageId } = req.params;
      const { id: senderId }: UserType = res.locals.userInfo;
      const { status } = req.query as ParametersMail;
      //--------------------------------------------------------------------------
      const path = `public/mail/${senderId}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      //--------------------------------------------------------------------------
      if (!req.files)
        throw new AppError('Oops!, no se pudo subir los archivos', 400);
      const files = req.files as Express.Multer.File[];
      const parseFiles = files.map(({ filename: name, ...file }) => {
        renameSync(file.path, path + '/' + name);
        return { name, path };
      });
      //--------------------------------------------------------------------------
      const data = JSON.parse(req.body.data) as PickMessageReply;
      //--------------------------------------------------------------------------
      const query = await MailServices.createReply(
        +messageId,
        { ...data, status, senderId },
        parseFiles
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public updateMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      if (!req.files)
        throw new AppError('Oops!, no se pudo subir los archivos', 400);
      const files = req.files as Express.Multer.File[];
      //--------------------------------------------------------------------------
      const path = `public/mail/${senderId}`;
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      //--------------------------------------------------------------------------
      const parseFiles = files.map(({ filename: name, ...file }) => {
        renameSync(file.path, path + '/' + name);
        return { name, path, attempt: this.attempt };
      });
      //-------------------------------------------------------------------------
      const data = JSON.parse(req.body.data) as Omit<PickMail, 'id'>;
      //--------------------------------------------------------------------------
      const query = await MailServices.updateMessage(
        +messageId,
        { ...data, senderId },
        parseFiles
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public archivedMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const query = await PayMailServices.archived(+messageId, senderId);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public doneMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const query = await MailServices.done(+messageId, senderId);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
  public quantityFiles: ControllerFunction = async (req, res, next) => {
    try {
      const { id }: UserType = res.locals.userInfo;
      const query = await PayMailServices.quantityFiles(id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export default MailControllers;
