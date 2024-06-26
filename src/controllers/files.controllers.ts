import { Request, Response, NextFunction } from 'express';
import {
  FilesServices,
  PathServices,
  SubTasksServices,
  UsersServices,
} from '../services';
import { BasicFiles, Files } from '@prisma/client';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import { unlinkSync } from 'fs';
import { TypeFileUser } from 'types/types';
import { convertToUtf8 } from '../utils/tools';
import { ControllerFunction } from 'types/patterns';
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // const userInfo: UserType = res.locals.userInfo;
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
export const uploadUserFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const typeFileUser = req.query.typeFile as TypeFileUser;
    if (!req.file)
      throw new AppError('Oops!, no se pudo subir el contrato', 400);
    const body = {
      [typeFileUser]: req.file.filename,
    };
    const query = await UsersServices.updateStatusFile(+id, body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const showFilesGeneral = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await FilesServices.getAllGeneralFile();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const uploadFilesGeneral = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file)
      throw new AppError('Oops!, no se pudo subir el contrato', 400);
    const body = {
      id: 0,
      dir: `general/${req.file.filename}`,
      name: convertToUtf8(req.file.originalname.toUpperCase()),
      createdAt: new Date(),
    };
    const query = await FilesServices.createGeneralFile(body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteUserFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { filename } = req.params;
    const typeFileUser = req.query.typeFile as TypeFileUser;

    const body = { [typeFileUser]: null };
    unlinkSync(`public/${typeFileUser}/${filename}`);
    const query = await UsersServices.updateStatusFile(+id, body);
    res.status(200).json(query);
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
    const subTasksId = parseInt(id);
    const userInfo: UserType = res.locals.userInfo;
    const type = req.query.status as Files['type'];
    const newFiles = req.files as Express.Multer.File[];
    const dir = await PathServices.subTask(subTasksId, type);
    const data = newFiles.map(({ filename }) => ({
      dir,
      type,
      subTasksId,
      name: filename,
      userId: userInfo.id,
    }));
    if (!req.files) return;
    await FilesServices.createManyFiles(data, subTasksId);
    const query = await SubTasksServices.find(subTasksId);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const uploadBasicFiles: ControllerFunction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subTasksId = +id;
    const type = req.query.status as BasicFiles['type'];
    const { profile }: UserType = res.locals.userInfo;
    const { firstName, lastName } = profile;
    if (!req.files) return;
    const newFiles = req.files as Express.Multer.File[];
    const dir = await PathServices.basicTask(subTasksId, type);
    const data = newFiles.map(({ filename: name, originalname }) => {
      const values = { dir, type, subTasksId, name, originalname };
      return { author: firstName + ' ' + lastName, ...values };
    });
    const query = await FilesServices.createManyBasicFiles(data, +subTasksId);
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
export const deleteFilesGeneral = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await FilesServices.deleteGeneralFile(+id);
    unlinkSync(`public/${query.dir}`);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
