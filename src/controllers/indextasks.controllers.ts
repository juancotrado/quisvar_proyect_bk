import { NextFunction, Request, Response } from 'express';
import { UserType } from '../middlewares/auth.middleware';
import { IndexTasksServices, WorkAreasServices } from '../services';
import fs from 'fs';

export const showIndexTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _index_task_id = parseInt(id);
    const query = await IndexTasksServices.find(_index_task_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createIndexTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await IndexTasksServices.create(body);
    if (query) {
      const newDir = query.dir + '/' + query.item + '.' + query.name;
      fs.mkdirSync(newDir);
    }
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updatIndexTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _task_id = parseInt(id);
    const oldTask = await IndexTasksServices.findShort(_task_id);
    const query = await IndexTasksServices.update(_task_id, body);
    if (query && oldTask) {
      const oldDir = oldTask.dir + '/' + oldTask.item + '.' + oldTask.name;
      const newDir = query.dir + '/' + query.item + '.' + query.name;
      fs.renameSync(oldDir, newDir);
    }
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteIndexTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await IndexTasksServices.delete(_task_id);
    if (query) {
      const path = query.dir + '/' + query.item + '.' + query.name;
      fs.rmSync(path, { recursive: true });
    }
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
