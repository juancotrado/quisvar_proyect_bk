import { Request, Response, NextFunction } from 'express';
import { FilesServices } from '../services';
import { Files } from '@prisma/client';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    if (!req.file) return;
    const status = req.query.status as Files['type'];
    const { filename } = req.file;
    const query = FilesServices.create({ ...body, filename }, status);
  } catch (error) {
    next(error);
  }
};
