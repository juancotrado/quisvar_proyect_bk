import { NextFunction } from 'express';
import { ControllerFunction } from 'types/patterns';
import { CategoryMailType } from 'types/types';
import { role } from '.';
import { MenuRole } from '../models/menuPoints';
import { UserType } from './auth.middleware';
import AppError from '../utils/appError';

export const verifyAccessMail =
  (typeRol: MenuRole[]): ControllerFunction =>
  async (req, res, next) => {
    try {
      const category = req.body.category as CategoryMailType;
      const userInfo: UserType = res.locals.userInfo;

      const hasAccess = role.accessMenuPoint(
        userInfo,
        typeRol,
        'tramites',
        category === 'DIRECT' ? 'tramite-regular' : 'comunicado'
      );
      if (!hasAccess) {
        throw new AppError(
          `Rol: ${userInfo.role.name} no tiene acceso a esta ruta`,
          400
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
