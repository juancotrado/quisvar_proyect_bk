import type { Request, Response, NextFunction } from 'express';
import { PathServices, Task_3_Services } from '../services';
import { mkdirSync, rmSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

export const showTaskLvl_3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task2_id = parseInt(id);
    const query = await Task_3_Services.find(_task2_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createTaskLvl_3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await Task_3_Services.create(body);
    const path = await PathServices.pathTask3(query.id);
    if (query) mkdirSync(path);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateTaskLvl_3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _task_3_id = parseInt(id);
    const oldDir = await PathServices.pathTask3(_task_3_id);
    const query = await Task_3_Services.update(_task_3_id, body);
    const path = query.item + '.' + query.name;
    const newDir = setNewPath(oldDir, path);
    if (query) renameDir(oldDir, newDir);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskLvl_3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id_2 = parseInt(id);
    const path = await PathServices.pathTask3(_task_id_2);
    const query = await Task_3_Services.delete(_task_id_2);
    if (query) rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
