import { Response, Request, NextFunction } from 'express';
import { StageServices } from '../services';

export const showListStages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await StageServices.findMany();
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
