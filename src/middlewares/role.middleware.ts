import { Request, Response, NextFunction } from 'express';
import { UserType } from './auth.middleware';
import { UserRole } from '@prisma/client';
import AppError from '../utils/appError';

const roleHandler =
  (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
    const userInfo: UserType = res.locals.userInfo;
    const { role } = userInfo;
    if (!roles.includes(role)) {
      throw new AppError(`${role} no tiene acceso a esta ruta`, 400);
    }
    next();
  };

class Role {
  private InitiHandler =
    (roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      const userInfo: UserType = res.locals.userInfo;
      const { role } = userInfo;
      if (!roles.includes(role)) {
        throw new AppError(`${role} no tiene acceso a esta ruta`, 400);
      }
      next();
    };

  public admin = this.InitiHandler([
    'SUPER_ADMIN',
    'ADMIN',
    'ASSISTANT',
    'ASSISTANT_ADMINISTRATIVE',
    'AREA_MOD',
  ]);
  public mod = roleHandler([
    'SUPER_ADMIN',
    'ADMIN',
    'ASSISTANT',
    'SUPER_MOD',
    'MOD',
  ]);
  public employee = roleHandler([
    'SUPER_ADMIN',
    'ADMIN',
    'ASSISTANT',
    'SUPER_MOD',
    'MOD',
    'EMPLOYEE',
    'ASSISTANT_ADMINISTRATIVE',
  ]);
}
export default new Role();

export const _admin_role = roleHandler([
  'SUPER_ADMIN',
  'ADMIN',
  'ASSISTANT',
  'ASSISTANT_ADMINISTRATIVE',
  'AREA_MOD',
]);
export const _mod_role = roleHandler([
  'SUPER_ADMIN',
  'ADMIN',
  'ASSISTANT',
  'SUPER_MOD',
  'MOD',
]);
export const _employee_role = roleHandler([
  'SUPER_ADMIN',
  'ADMIN',
  'ASSISTANT',
  'SUPER_MOD',
  'MOD',
  'EMPLOYEE',
  'ASSISTANT_ADMINISTRATIVE',
]);
