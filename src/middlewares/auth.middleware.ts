import { Office, Profiles, Users } from '@prisma/client';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { MenuRoles } from '../models/menuPoints';
import { UsersServices } from '../services';

interface RoleAuht {
  id: number;
  name: string;
  menuPoints: MenuRoles[];
}
export type UserType = Users & { profile: Profiles } & { role: RoleAuht } & {
  office: Office;
};

config();
const SECRET = process.env.SECRET || 'helloWorld';

const authenticateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer'))
    return next(
      new AppError(
        '¡Usted no se ha identificado! por favor inicie sesión para obtener acceso.',
        401
      )
    );
  const token = authorization.split(' ')[1];
  try {
    const { id } = jwt.verify(token, SECRET) as {
      id: number;
    };
    const user = await UsersServices.find(id);
    if (!user?.status)
      return next(
        new AppError('El propietario de este token ya no está disponible.', 401)
      );
    res.locals.userInfo = user;
    return next();
  } catch (error) {
    next(error);
  }
};

export const authenticateHandlerByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = ('Bearer ' + req.query.token) as string;
  console.log(authorization);
  if (!authorization || !authorization.startsWith('Bearer'))
    return next(
      new AppError(
        '¡Usted no se ha identificado! por favor inicie sesión para obtener acceso.',
        401
      )
    );
  const token = authorization.split(' ')[1];
  try {
    const { id } = jwt.verify(token, SECRET) as {
      id: number;
    };
    const user = await UsersServices.find(id);
    if (!user?.status)
      return next(
        new AppError('El propietario de este token ya no está disponible.', 401)
      );
    res.locals.userInfo = user;
    return next();
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
