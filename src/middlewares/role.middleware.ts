import { Request, Response, NextFunction } from 'express';
import { UserType } from './auth.middleware';
// import { UserRole } from '@prisma/client';
import AppError from '../utils/appError';
import { MenuAccess, MenuRole } from '../models/menuPoints';

const roleHandler =
  (roles: any[]) => (req: Request, res: Response, next: NextFunction) => {
    const userInfo: UserType = res.locals.userInfo;
    // console.log(roles);
    console.log('userInfo', JSON.stringify(userInfo, null, 2));
    // const { role } = userInfo;
    // if (!roles.includes(role)) {
    //   throw new AppError(`${role} no tiene acceso a esta ruta`, 400);
    // }
    next();
  };

class Role {
  public RoleHandler =
    (typeRol: MenuRole, menu: MenuAccess, subMenu?: string) =>
    (req: Request, res: Response, next: NextFunction) => {
      const userInfo: UserType = res.locals.userInfo;
      let hasAccess: boolean | undefined = false;

      if (subMenu) {
        const findMenu = userInfo.role.menuPoints.find(
          menuPoint => menuPoint.route === menu
        );
        hasAccess = findMenu?.menu?.some(
          menuPoint =>
            menuPoint.route === subMenu && menuPoint.typeRol === typeRol
        );
      } else {
        hasAccess = userInfo.role.menuPoints.some(
          menuPoint => menuPoint.route === menu && menuPoint.typeRol === typeRol
        );
      }

      if (!hasAccess) {
        throw new AppError(
          `Rol: ${userInfo.role.name} no tiene acceso a esta ruta`,
          400
        );
      }
      next();
    };
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
