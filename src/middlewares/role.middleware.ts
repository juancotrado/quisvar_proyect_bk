import { Request, Response, NextFunction } from 'express';
import { UserType } from './auth.middleware';
import { UserRole } from '@prisma/client';
import AppError from '../utils/appError';

const roleHandler =
  (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
    const userInfo: UserType = res.locals.userInfo;
    const { role } = userInfo;
    if (!roles.includes(role)) {
      throw new AppError(
        `${role} does not have permissions for this route`,
        400
      );
    }
    next();
  };

export const _admin_role = roleHandler(['ADMIN']);
export const _mod_role = roleHandler(['ADMIN', 'MOD']);
export const _employee_role = roleHandler(['ADMIN', 'MOD', 'EMPLOYEE']);
