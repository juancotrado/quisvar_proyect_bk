import { Request, Response, NextFunction } from 'express';
import { authServices } from '../services';
import AppError from '../utils/appError';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const result = await authServices.auth(body);
    const token = authServices.getToken(result);
    const { password, status, ...data } = result;
    if (status) return res.json({ ...data, token });
    throw new AppError(
      `Tu cuenta ha sido suspendida, hable con el admnistrador`,
      400
    );
  } catch (error) {
    next(error);
  }
};
