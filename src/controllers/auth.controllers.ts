import { Request, Response, NextFunction } from 'express';
import { authServices } from '../services';
import { Prisma } from '@prisma/client';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const result = await authServices.auth(body);
    const token = authServices.getToken(result);
    const { password, ...data } = result;
    res.json({ ...data, token });
  } catch (error) {
    next(error);
  }
};
