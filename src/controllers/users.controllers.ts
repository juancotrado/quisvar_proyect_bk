import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { UsersServices } from '../services';
import { userProfilePick } from '../utils/format.server';
import AppError from '../utils/appError';

export const showUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await UsersServices.getUsers();
    if (query.length == 0) {
      throw new AppError('no hay naa', 404);
    }
    res.status(200).json(query);
  } catch (error) {
    next(error);
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
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
