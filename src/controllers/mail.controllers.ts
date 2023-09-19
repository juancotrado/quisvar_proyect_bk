import { Request, Response, NextFunction } from 'express';
import { MailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';

export const showMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { params } = req.query;
    // console.log(req.query, '<==');
    const { id } = req.params;
    const userId = parseInt(id);
    console.log(userId);
    const query = await MailServices.getByUser(userId, {
      // skip: 0,
      limit: 20,
      type: 'RECEIVER',
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
    console.log(messageId);
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
    const { body } = req;
    const query = await MailServices.create({ ...body, senderId });
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
