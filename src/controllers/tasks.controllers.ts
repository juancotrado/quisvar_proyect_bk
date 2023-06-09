import { NextFunction, Request, Response } from 'express';
import { PathServices, TasksServices } from '../services';
import { SubTasks } from '@prisma/client';
import fs from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

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
    const path = await PathServices.pathTask(query.id);
    if (query) fs.mkdirSync(path);
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
    const oldDir = await PathServices.pathTask(_task_id);
    const query = await TasksServices.update(_task_id, body);
    const path = query.item + '.' + query.name;
    const newDir = setNewPath(oldDir, path);
    if (query) renameDir(oldDir, newDir);
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
    const path = await PathServices.pathTask(_task_id);
    const query = await TasksServices.delete(_task_id);
    if (query) fs.rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
