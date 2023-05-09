import { NextFunction, Request, Response } from 'express';
import { workareasServices } from '../services';
import { Prisma } from '@prisma/client';


export const showWorkareas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await workareasServices.getWorkareas();
    if (query.length == 0) {
      return res.status(200).json({ message: 'no existen areas de trabajo' });
    }
    res.status(200).json(query);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json(error);
    }
  }
};

export const deleteWorkarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _id = parseInt(id);
    const query = await workareasServices.delete(_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
