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
  const token = authorization?.split(' ').at(1);
  try {
    if (SECRET && token) {
      const decodedToken = jwt.verify(token, SECRET);
      const userInfo = decodedToken as UserType;
      res.locals.userInfo = userInfo;
      return next();
    }
    throw new AppError('secret word undefined', 404);
  } catch (error) {
    next(error);
  }
};

export default authenticateHandler;
