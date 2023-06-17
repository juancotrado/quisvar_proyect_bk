import { Response, Request, NextFunction } from 'express';
import AppError from '../utils/appError';
import { UserType } from './auth.middleware';
import { prisma } from '../utils/prisma.server';
import { error } from 'console';

const taskVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userInfo: UserType = res.locals.userInfo;
    const userId = userInfo.id;
    const _sub_task_id = parseInt(id);
    const verifyTask = await prisma.taskOnUsers.findUnique({
      where: {
        subtaskId_userId: {
          userId,
          subtaskId: _sub_task_id,
        },
      },
    });
    if (!verifyTask) {
      throw new AppError(`No tiene ninguna tarea en esta ruta`, 404);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyStatusUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    if (!userInfo.status) {
      throw new AppError(
        `Tu cuenta ha sido suspendida, hable con el admnistrador`,
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
export default taskVerify;
