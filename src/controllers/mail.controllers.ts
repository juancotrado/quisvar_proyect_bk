import { Request, Response, NextFunction } from 'express';
import { MailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import { ParametersMail, PickMail, PickMessageReply } from 'types/types';
import { existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { Messages } from '@prisma/client';

export const showMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, ...params } = req.query as ParametersMail;
    const userInfo: UserType = res.locals.userInfo;
    const userId = userInfo.id;
    const offset = parseInt(`${skip}`);
    const _skip = !isNaN(offset) ? offset : undefined;
    const newParams = { skip: _skip, ...params };
    const query = await MailServices.getByUser(userId, newParams);
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

export const createReplyMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const senderId = userInfo.id;
    const { status } = req.query as ParametersMail;
    // const attempt = `${new Date().getTime()}`;
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const files = req.files as Express.Multer.File[];
    const path = `public/mail/${senderId}`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const parseFiles = files.map(({ filename: name, ...file }) => {
      renameSync(file.path, path + '/' + name);
      return { name, path };
    });
    const { body } = req;
    const data = JSON.parse(body.data) as PickMessageReply;
    const query = await MailServices.createReply(
      { ...data, status, senderId },
      parseFiles
    );
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const senderId = userInfo.id;
    const { id } = req.params;
    const _messageId = parseInt(id);
    const attempt = `${new Date().getTime()}`;
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const files = req.files as Express.Multer.File[];
    const path = `public/mail/${senderId}`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const parseFiles = files.map(({ filename: name, ...file }) => {
      renameSync(file.path, path + '/' + name);
      return { name, path, attempt };
    });
    const { body } = req;
    const data = JSON.parse(body.data) as PickMail;
    const query = await MailServices.updateMessage(
      _messageId,
      { ...data, senderId },
      parseFiles
    );
    res.status(201).json(query);
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
    const attempt = `${new Date().getTime()}`;
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const files = req.files as Express.Multer.File[];
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
    next(error);
  }
};

export const archivedMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const senderId = userInfo.id;
    const { id } = req.params;
    const _messageId = parseInt(id);
    const query = await MailServices.archived(_messageId, senderId);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const doneMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const senderId = userInfo.id;
    const { id } = req.params;
    const _messageId = parseInt(id);
    const query = await MailServices.done(_messageId, senderId);
    res.status(201).json(query);
  } catch (error) {
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

export const createVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const userInfo: UserType = res.locals.userInfo;
    const { id: senderId } = userInfo;
    const _messageId = parseInt(id);
    //-----------------------------------------------------------------------------
    if (!req.file)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { filename, path: FilePath } = req.file as Express.Multer.File;
    const path = `public/voucher/${id}`;
    const voucher = path + '/' + filename;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    renameSync(FilePath, path + '/' + filename);
    //-----------------------------------------------------------------------------
    const query = await MailServices.createVoucher(_messageId, {
      senderId,
      voucher,
    });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const declineVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { id: senderId } = userInfo;
    const { id } = req.params;
    const status = req.query.status as Messages['status'];
    const _messageId = parseInt(id);
    const query = await MailServices.updateVoucher(_messageId, {
      senderId,
      status,
    });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
