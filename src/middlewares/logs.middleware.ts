import { ControllerFunction } from 'types/patterns';
import { UserType } from './auth.middleware';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class LogsMiddleware {
  static role: ControllerFunction = async (req, res, next) => {
    try {
      const { ip } = req;
      console.log({ ip: req.ip, ips: req.ips });
      const { id: userId, profile: user }: UserType = res.locals.userInfo;
      const log = await prisma.logs.create({
        data: { ip, query: { userId, user } },
      });
      if (!log) throw new AppError('check logs', 404);
      next();
    } catch (err) {
      next(err);
    }
  };
}
export default LogsMiddleware;
