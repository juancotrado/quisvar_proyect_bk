import { Request, Response, NextFunction } from 'express';
import { MailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import { PickMail } from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';

export const showMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { params } = req.query;
    const userInfo: UserType = res.locals.userInfo;
    const userId = userInfo.id;
    const query = await MailServices.getByUser(userId, {
      // skip: 0,
      // type: 'SENDER',
      // status: true,
    });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const messageId = parseInt(id);
    const query = await MailServices.getMessage(messageId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const senderId = userInfo.id;
    const attempt = `${new Date().getTime}`;
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const files = req.files as Express.Multer.File[];
    console.log(attempt);
    const path = `public/mail/${senderId}`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const parseFiles = files.map(({ filename: name, ...file }) => {
      renameSync(file.path, path + '/' + name);
      return { name, path, attempt };
    });
    const { body } = req;
    const data = JSON.parse(body.data) as PickMail;
    const query = await MailServices.create({ ...data, senderId }, parseFiles);
    res.status(201).json(query);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const quantityFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { id } = userInfo;
    const query = await MailServices.quantityFiles(id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
