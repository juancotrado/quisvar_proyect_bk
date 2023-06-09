import { NextFunction, Request, Response } from 'express';
import { UserType } from '../middlewares/auth.middleware';
import {
  IndexTasksServices,
  PathServices,
  WorkAreasServices,
} from '../services';
import fs from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

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
    const path = await PathServices.pathIndexTask(query.id);
    if (query) fs.mkdirSync(path);
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
    const oldDir = await PathServices.pathIndexTask(_task_id);
    const query = await IndexTasksServices.update(_task_id, body);
    const path = query.item + '.' + query.name;
    const newDir = setNewPath(oldDir, path);
    if (query) renameDir(oldDir, newDir);
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
    const path = await PathServices.pathIndexTask(_task_id);
    const query = await IndexTasksServices.delete(_task_id);
    if (query) fs.rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
