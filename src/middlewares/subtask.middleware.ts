import { Response, Request, NextFunction } from 'express';
import AppError from '../utils/appError';
import { UserType } from './auth.middleware';
import { SubTasks, prisma } from '../utils/prisma.server';

const permStatus: SubTasks['status'][] = ['UNRESOLVED', 'PROCESS'];
type StatusType = { status: SubTasks['status'] };

export const statusVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as StatusType;
    if (!permStatus.includes(body.status)) {
      throw new AppError(
        `You dont have permission with ${body.status} for this route`,
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
