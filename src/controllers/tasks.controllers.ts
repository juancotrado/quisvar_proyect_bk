import { NextFunction, Request, Response } from 'express';
import { Prisma, Users } from '@prisma/client';
import { TasksServices } from '../services';

// export const showTasks = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const query = await TasksServices.getTask();
//     if (query.length == 0) {
//       return res.status(200).json({ message: 'no hay tareas pendientes' });
//     }
//     res.status(200).json(query);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       res.status(400).json(error);
//     }
//   }
// };

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const _task_id = parseInt(id);
    const query = await TasksServices.updateStatus(_task_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await TasksServices.find(_task_id);
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
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

// export const updateTask = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { body } = req;
//     const { id } = req.params;
//     const _task_id = parseInt(id);
//     const query = await TasksServices.update(_task_id, body);
//     res.status(200).json(query);
//   } catch (error) {
//     next(error);
//   }
// };

export const deleteTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _id = parseInt(id);
    const query = await TasksServices.delete(_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
