import { Request, Response, NextFunction } from 'express';
import { UserType } from './auth.middleware';
import { UserRole } from '@prisma/client';
import AppError from '../utils/appError';

const listRoles = Object.keys(UserRole);
export const userRoleHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { role } = userInfo;
    if (!listRoles.includes(role)) {
      throw new AppError(
        `${role} does not have permissions for this route`,
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const adminRoleHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { role } = userInfo;
    if (role !== UserRole.ADMIN) {
      throw new AppError(
        `${role} does not have permissions for this route`,
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const modRoleHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { role } = userInfo;
    if (role == UserRole.EMPLOYEE) {
      throw new AppError(
        `${role} does not have permissions for this route`,
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
