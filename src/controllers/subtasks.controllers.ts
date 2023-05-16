import { NextFunction, Request, Response } from 'express';
import { SubTasksServices } from '../services';

export const showSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.find(_subtask_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await SubTasksServices.create(body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.update(_subtask_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteSubTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.delete(_subtask_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
