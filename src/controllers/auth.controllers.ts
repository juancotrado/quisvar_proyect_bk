/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { authServices } from '../services';
import AppError from '../utils/appError';
import { UserType } from '../middlewares/auth.middleware';
import QueryServices from '../services/queries.services';

class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
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
  }

  public static async recoverPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userInfo: UserType = res.locals.userInfo;
      const { dni } = userInfo.profile;
      const { oldpassword: password, newpassword } = req.body;
      const verifyPassword = await authServices.auth({ dni, password });
      if (!verifyPassword)
        throw new AppError(`Error en el cambio de contraseña`, 400);
      const result = await authServices.updatePassword(
        userInfo.id,
        newpassword
      );
      const token = authServices.getToken(result);
      const { password: pd, status, ...data } = result;
      return res.json({ ...data, token });
    } catch (error) {
      next(error);
    }
  }

  public static async queryroute(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const query = new QueryServices();
    const data = await query.updateData();
    return res.json(data);
  }
}

export default AuthController;
