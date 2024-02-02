import { Profiles, Users } from '@prisma/client';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { MenuRoles } from '../models/menuPoints';

interface RoleAuht {
  id: number;
  name: string;
  menuPoints: MenuRoles[];
}
export type UserType = Users & { profile: Profiles } & { role: RoleAuht };

config();
const SECRET = process.env.SECRET;

const authenticateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const clientIP = req.ip;
  // console.log(clientIP);
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];
  try {
    if (SECRET && token) {
      const decodedToken = jwt.verify(token, SECRET);
      const userInfo = decodedToken as UserType;
      res.locals.userInfo = userInfo;
      return next();
    }
    throw new AppError(
      'Usted no cuenta con un token, por favor inserta uno',
      404
    );
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
    throw new AppError('Palabra secreta indefinida', 400);
  } catch (error) {
    next(error);
  }
};

export default authenticateHandler;
