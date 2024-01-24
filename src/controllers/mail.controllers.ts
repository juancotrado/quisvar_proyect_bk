import { Request, Response, NextFunction } from 'express';
import { PayMailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import {
  ParametersMail,
  ParametersPayMail,
  PickMail,
  PickMessageReply,
} from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { PayMessages } from '@prisma/client';
import { ControllerFunction } from 'types/patterns';
import MailServices from '../services/mail.services';

class MailControllers {
  public showMesssages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip, ...params } = req.query as ParametersMail;
      const { id: userId }: UserType = res.locals.userInfo;
      const newParams = { skip, ...params };
      const query = await MailServices.getByUser(userId, 'GLOBAL', newParams);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export class MailDirectControllers {
  public showMesssages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip, ...params } = req.query as ParametersMail;
      const { id: userId }: UserType = res.locals.userInfo;
      const newParams = { skip, ...params };
      const query = await MailServices.getByUser(userId, 'DIRECT', newParams);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export default MailControllers;

export const showMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, ...params } = req.query as ParametersPayMail;
    const { id: userId }: UserType = res.locals.userInfo;
    const offset = parseInt(`${skip}`);
    const _skip = !isNaN(offset) ? offset : undefined;
    const newParams = { skip: _skip, ...params };
    const query = await PayMailServices.getByUser(userId, newParams);
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
    const query = await PayMailServices.getMessage(messageId);
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
    const { status } = req.query as ParametersPayMail;
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
    const query = await PayMailServices.createReply(
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
    const query = await PayMailServices.updateMessage(
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
    //--------------------------------------------------------------------------
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
    //--------------------------------------------------------------------------
    const { body } = req;
    const data = JSON.parse(body.data) as PickMail;
    const query = await PayMailServices.create(
      { ...data, senderId },
      parseFiles
    );
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
    const query = await PayMailServices.archived(_messageId, senderId);
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
    const { paymentPdfData } = req.body;
    const senderId = userInfo.id;
    const { id } = req.params;
    const _messageId = parseInt(id);
    const query = await PayMailServices.done(
      _messageId,
      senderId,
      paymentPdfData
    );
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
    const query = await PayMailServices.quantityFiles(id);
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
    const userInfo: UserType = res.locals.userInfo;
    const { id: senderId } = userInfo;
    const _messageId = parseInt(id);
    //--------------------------------------------------------------------------
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const files = req.files as Express.Multer.File[];
    const path = `public/voucher/${senderId}`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const parseFiles = files.map(({ filename: name, ...file }) => {
      renameSync(file.path, path + '/' + name);
      return { name, path };
    });
    //--------------------------------------------------------------------------
    await PayMailServices.createVoucher(_messageId, { senderId }, parseFiles);
    res.status(200).json(parseFiles);
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
    const status = req.query.status as PayMessages['status'];
    const _messageId = parseInt(id);
    const query = await PayMailServices.updateVoucher(_messageId, {
      senderId,
      status,
    });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
