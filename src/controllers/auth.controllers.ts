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
    if (result == false) {
      return next({
        status: 404,
        message: 'email inexistente',
        error_content: result,
      });
    }
    if (!result) {
      return next({
        status: 404,
        message: 'contraseña incorrecta',
        error_content: result,
      });
    }
    const token = authServices.getToken(result);
    const { password, ...data } = result;
    res.json({ ...data, token });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json(error);
    }
  }
};
