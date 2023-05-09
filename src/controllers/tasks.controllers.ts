import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { tasksServices } from '../services';

export const showTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await tasksServices.getTask();
    if (query.length == 0) {
      return res.status(200).json({ message: 'no hay tareas pendientes' });
    }
    res.status(200).json(query);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json(error);
    }
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
    const query = await tasksServices.find(_task_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await tasksServices.delete(_task_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
