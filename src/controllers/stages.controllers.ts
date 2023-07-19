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
export const createStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await StageServices.create(body);
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const _stage_id = parseInt(id);
    const query = await StageServices.update(_stage_id, body);
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _stage_id = parseInt(id);
    const query = await StageServices.delete(_stage_id);
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
