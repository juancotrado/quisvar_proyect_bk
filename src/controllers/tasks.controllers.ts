import { NextFunction, Request, Response } from 'express';
import { TasksServices } from '../services';
import { SubTasks } from '@prisma/client';
import fs from 'fs';

export const showTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const status = req.query.status as SubTasks['status'];
    const _task_id = parseInt(id);
    const query = await TasksServices.find(_task_id, status);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await TasksServices.create(body);
    if (query) {
      const newDir = query.dir + '/' + query.item + '.' + query.name;
      fs.mkdirSync(newDir);
    }
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _task_id = parseInt(id);
    const oldTask = await TasksServices.findShort(_task_id);
    const query = await TasksServices.update(_task_id, body);
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

export const deleteTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await TasksServices.delete(_task_id);
    if (query) {
      const path = query.dir + '/' + query.item + '.' + query.name;
      fs.rmSync(path, { recursive: true });
    }
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
