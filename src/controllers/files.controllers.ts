import { Request, Response, NextFunction } from 'express';
import { FilesServices, PathServices, SubTasksServices } from '../services';
import { Files } from '@prisma/client';
import { UserType } from '../middlewares/auth.middleware';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userInfo: UserType = res.locals.userInfo;
    const status = req.query.status as Files['type'];
    const _subtask_id = parseInt(id);
    if (!req.file) return;
    const { filename } = req.file;
    await FilesServices.create(_subtask_id, filename, status, userInfo.id);
    const query = await SubTasksServices.find(_subtask_id);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const uploadFileContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!req.file) return;
    const { filename } = req.file;
    res.status(201).json({ id, filename });
  } catch (error) {
    next(error);
  }
};

export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userInfo: UserType = res.locals.userInfo;
    const status = req.query.status as Files['type'];
    const _subtask_id = parseInt(id);
    const newFiles = req.files as Express.Multer.File[];
    const dir = await PathServices.pathSubTask(_subtask_id, status);
    const data = newFiles.map(file => ({
      dir,
      type: status,
      subTasksId: _subtask_id,
      name: file.filename,
      userId: userInfo.id,
    }));
    if (!req.files) return;
    await FilesServices.createManyFiles(data, _subtask_id);
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
    const fileDelete = await FilesServices.delete(_file_id);
    const query = await SubTasksServices.find(fileDelete.subTasksId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
