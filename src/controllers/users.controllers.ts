import { NextFunction, Request, Response } from 'express';
import { UsersServices } from '../services';
import { userProfilePick } from '../utils/format.server';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import { copyFileSync } from 'fs';

export const showUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await UsersServices.getAll();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _user_id = parseInt(id);
    const query = await UsersServices.find(_user_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showTaskByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { id } = userInfo;
    const query = await UsersServices.findListTask(id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const showSubTasksByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { project } = req.query;
    const _id = parseInt(id);
    const _project = parseInt(project as string);
    const query = await UsersServices.findListSubTask(_id, _project);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const [cv, declaration] = req.files as Express.Multer.File[];
    const body: userProfilePick = req.body;
    const query = await UsersServices.create({
      ...body,
      cv: cv.filename,
      declaration: declaration.filename,
    });
    copyFileSync(
      `public/cv/${declaration.filename}`,
      `public/declaration/${declaration.filename}`
    );
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _id = parseInt(id);
    const query = await UsersServices.update(_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _id = parseInt(id);
    const query = await UsersServices.delete(_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
