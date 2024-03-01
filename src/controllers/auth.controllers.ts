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
const JWT_RESET = process.env.JWT_RESET || 'JWT_RESET';

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
      const fullName = user.profile?.firstName + ' ' + user.profile?.lastName;
      sendLinkToRecoveryPassword(user.email, fullName, verficationLink);
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
      const { newPassword, verifyPassword } = req.body;
      if (newPassword !== verifyPassword)
        throw new AppError('Contraseñas con coinciden.', 400);
      const resetToken = req.headers.reset as string;
      if (!resetToken || !newPassword)
        throw new AppError('Datos incorrectos.', 400);

      const { id } = jwt.verify(resetToken, JWT_RESET) as {
        id: number;
      };
      const user = await UsersServices.findByTokenAndId(id, resetToken);
      await authServices.updatePassword(user.id, newPassword);
      res.json({
        msg: 'Contraseña restablecida exitosamente.',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'jwt expired')
          return next(
            new AppError(
              'El proceso expiro, vuelva a enviar otra solicitud de recuperacion.',
              401
            )
          );
        if (error.message === 'jwt malformed')
          return next(new AppError('Algo salio mal.', 401));
      }
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
