import type { Request, Response, NextFunction } from 'express';
import { PathServices, Task_2_Services } from '../services';
import { mkdirSync, rmSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';
import { SubTasks } from '@prisma/client';

export const showTaskLvl_2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task2_id = parseInt(id);
    const query = await Task_2_Services.find(_task2_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createTaskLvl_2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await Task_2_Services.create(body);
    const path = await PathServices.pathTask2(query.id);
    if (query) mkdirSync(path);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateTaskLvl_2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _task_2_id = parseInt(id);
    const oldDir = await PathServices.pathTask2(_task_2_id);
    const query = await Task_2_Services.update(_task_2_id, body);
    const path = query.item + '.' + query.name;
    const newDir = setNewPath(oldDir, path);
    if (query) renameDir(oldDir, newDir);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskLvl_2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const path = await PathServices.pathTask2(_task_id);
    const query = await Task_2_Services.delete(_task_id);
    if (query) rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
