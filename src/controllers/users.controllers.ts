import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { UsersServices } from '../services';
import { userProfilePick } from '../utils/format.server';

export const showUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await UsersServices.getUsers();
    if (query.length == 0) {
      return res.status(404).json({ message: 'no hay naa' });
    }
    res.status(200).json(query);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json(error);
    }
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body: userProfilePick = req.body;
    const query = await UsersServices.createUser(body);
    if (!query)
      return next({
        status: 400,
        message: 'Oops!, DNI has been registered',
        error_content: query,
      });
    res.status(200).json(query);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      res.status(400).json(error);
    }
  }
};
