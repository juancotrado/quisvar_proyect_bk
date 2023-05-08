import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { tasksServices } from '../services';

export const showTask = async (
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
