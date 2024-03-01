import { Request, Response, NextFunction } from 'express';
import { authServices } from '../services';
import AppError from '../utils/appError';
import { UserType } from '../middlewares/auth.middleware';
import QueryServices from '../services/queries.services';
import { enviarCorreoAgradecimiento } from '../utils/mailer';

class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const user = await authServices.auth(body);
      const token = authServices.getToken(user.id);
      const { status, ...data } = user;
      if (!status)
        throw new AppError(
          `Tu cuenta ha sido suspendida, hable con el admnistrador`,
          400
        );
      return res.json({ ...data, password: 'unknow', token });
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
      const { email } = userInfo;
      const { oldpassword: password, newpassword } = req.body;
      const verifyPassword = await authServices.auth({ dni, password });
      if (!verifyPassword)
        throw new AppError(`Error en el cambio de contraseña`, 400);
      const result = await authServices.updatePassword(
        userInfo.id,
        newpassword
      );
      const token = authServices.getToken(result.id);
      enviarCorreoAgradecimiento(
        email,
        `Tus datos de acceso son: \n DNI: ${dni} \n Contraseña: ${newpassword}`
      );
      return res.json({ ...result, password: 'unknow', token });
    } catch (error) {
      next(error);
    }
  }

  public static async queryroute(req: Request, res: Response) {
    const query = new QueryServices();
    const data = await query.updateData();
    return res.json(data);
  }
}

export default AuthController;
