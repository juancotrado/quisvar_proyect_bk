import { NextFunction, Request, Response } from 'express';
import { UsersServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';

export const showProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { id } = userInfo;
    const query = await UsersServices.find(id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
