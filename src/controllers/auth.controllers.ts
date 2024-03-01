import { Request, Response, NextFunction } from 'express';
import { UsersServices, authServices } from '../services';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { UserType } from '../middlewares/auth.middleware';
import QueryServices from '../services/queries.services';
import {
  enviarCorreoAgradecimiento,
  sendLinkToRecoveryPassword,
} from '../utils/mailer';
import verificationUsersServices from '../services/verficationUser.services';
const SECRET = process.env.SECRET || 'helloWorld';

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
  public static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { dni } = req.body;
      const user = await UsersServices.findByDni(dni);
      const token = authServices.getTokenToResetPassword(user.id, dni);
      await verificationUsersServices.saveToken(token, user.id);

      const verficationLink = `${req.headers.referer}#/login/recuperar-contraseña/${token}`;
      sendLinkToRecoveryPassword(user.email, verficationLink);
      res.json({
        msg: 'Se envio un codigo para restablecer su contraseña a su correo',
      });
    } catch (error) {
      next(error);
    }
  }
  public static async newPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log('asdasd');
      const { newPassword } = req.body;
      const resetToken = req.headers.ResetToken as string;
      console.log({ resetToken, newPassword });
      if (!resetToken || !newPassword)
        return next(new AppError('Datos incorrectos.', 400));
      const { id } = jwt.verify(resetToken, SECRET) as {
        id: number;
      };
      const user = await UsersServices.findByTokenAndId(id, resetToken);
      console.log(user);
      await authServices.updatePassword(user.id, newPassword);
      res.json({
        msg: 'Contraseña restablecida exitosamente.',
      });
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
