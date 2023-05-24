import { NextFunction, Request, Response } from 'express';
import { UserType } from '../middlewares/auth.middleware';
import { IndexTasksServices } from '../services';

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
    const query = await IndexTasksServices.update(_task_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

// export const updateTaskStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;
//     const { body } = req;
//     const _task_id = parseInt(id);
//     const query = await TasksServices.updateStatus(_task_id, body);
//     res.status(200).json(query);
//   } catch (error) {
//     next(error);
//   }
// };

export const deleteIndexTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await IndexTasksServices.delete(_task_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
