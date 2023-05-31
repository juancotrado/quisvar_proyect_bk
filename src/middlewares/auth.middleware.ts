import { Profiles, Users } from '@prisma/client';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';

export type UserType = Users & { profile: Profiles };

config();
const SECRET = process.env.SECRET;

const authenticateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];
  try {
    if (SECRET && token) {
      const decodedToken = jwt.verify(token, SECRET);
      const userInfo = decodedToken as UserType;
      res.locals.userInfo = userInfo;
      return next();
    }
    throw new AppError('You do not have a token, please insert one', 404);
  } catch (error) {
    next(error);
  }
};

export const verifySecretEnv = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (SECRET) return next();
    throw new AppError('Secret word undefined', 400);
  } catch (error) {
    next(error);
  }
};

export default authenticateHandler;
