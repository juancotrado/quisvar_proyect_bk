import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';
import { Prisma } from '@prisma/client';

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'fail';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json(err);
  }
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};

export default globalErrorHandler;
