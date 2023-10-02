import { Request, Response, NextFunction } from 'express';
import { FeedBackServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';

export const findFeedbacks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await FeedBackServices.find(_subtask_id);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const createFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const userId = userInfo.id;
    const { body } = req;
    const query = await FeedBackServices.create({ ...body, userId });
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const editFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await FeedBackServices.update(body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
