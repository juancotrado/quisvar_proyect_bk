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
  const typingError =
    err.message.length > 500
      ? 'typing error in variables, enter the necessary fields'
      : err.message;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002')
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: `Error with column ${err.meta?.target}`,
        error: err,
      });
    if (err.code === 'P2003') {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: `Foreing key error with columns ${err.meta?.field_name}`,
        error: err,
      });
    }
    return res.status(400).json(err);
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: typingError,
  });
};

export default globalErrorHandler;
