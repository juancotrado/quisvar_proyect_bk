import { Request, Response, NextFunction, query } from 'express';
import { FilesServices, SubTasksServices } from '../services';
import { Files } from '@prisma/client';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const status = req.query.status as Files['type'];
    const _subtask_id = parseInt(id);
    if (!req.file) return;
    const { filename } = req.file;
    await FilesServices.create(_subtask_id, filename, status);
    const query = await SubTasksServices.find(_subtask_id);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _file_id = parseInt(id);
    const query = await FilesServices.delete(_file_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
