/* eslint-disable @typescript-eslint/no-unused-vars */
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
      ? 'Variables incorrectas, ingrese los campos necesarios'
      : err.message;
  //---------------------------error_such_files----------------------------
  if (req.url.includes('uploads') || req.url.includes('index')) {
    const pageNotFound = res.locals.pageNotFound as string;
    return res.sendFile(pageNotFound);
  }
  //-----------------------------------------------------------------------

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002')
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: `Error en la columna"${err.meta?.target}"`,
        error: err,
      });
    if (err.code === 'P2003') {
      return res.status(err.statusCode).json({
        status: err.statusCode,
        message: `Error de llave foranea en la columna ${err.meta?.field_name}`,
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
