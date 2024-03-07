import { Response, Request, NextFunction } from 'express';
import AppError from '../utils/appError';
import { UserType } from './auth.middleware';
import { SubTasks, Users } from '../utils/prisma.server';
import { SubTasksServices } from '../services';

const permStatus: SubTasks['status'][] = ['UNRESOLVED', 'PROCESS', 'INREVIEW'];
// const permRole: Users['role'][] = ['ADMIN', 'MOD'];
type StatusType = { status: SubTasks['status'] };

export const statusVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as StatusType;
    const userInfo: UserType = res.locals.userInfo;
    // const { role } = userInfo;
    // if (!permRole.includes(role) && !permStatus.includes(body.status)) {
    //   throw new AppError(
    //     `No cuenta con permisos con ${body.status} para esta ruta`,
    //     400
    //   );
    // }
    next();
  } catch (error) {
    next(error);
  }
};

export const validTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId, indexTaskId } = req.body;
    if (taskId || indexTaskId) {
      next();
    }
    throw new AppError(`Necesita taskId o indexTaskId`, 400);
  } catch (error) {
    next(error);
  }
};
export const validSubtaskByIdAndStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = await SubTasksServices.find(+id);
    if (status !== 'UNRESOLVED')
      throw new AppError('No puede eliminar esta subtarea', 400);
    next();
  } catch (error) {
    next(error);
  }
};
