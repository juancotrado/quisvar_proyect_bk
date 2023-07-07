import { Request, Response, NextFunction } from 'express';
import { FeedBackServices } from '../services';

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
    const { body } = req;
    const query = await FeedBackServices.create(body);
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
