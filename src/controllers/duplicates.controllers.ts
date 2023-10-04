import type { Request, Response, NextFunction } from 'express';
import { DuplicatesServices, _materialPath, _reviewPath } from '../services';

export const duplicateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _project_id = parseInt(id);
    const { name } = req.body;
    const duplicate = await DuplicatesServices.project(_project_id, name);
    res.status(201).json(duplicate);
  } catch (error) {
    next(error);
  }
};

export const addNewStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(201).json({ status: true });
  } catch (error) {
    next(error);
  }
};

export const duplicateStages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _stage_id = parseInt(id);
    const { name } = req.body;
    const duplicate = await DuplicatesServices.stage(_stage_id, name);
    res.status(201).json(duplicate);
  } catch (error) {
    next(error);
  }
};

export const duplicateLevels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _level_id = parseInt(id);
    const { name } = req.body;
    const duplicate = await DuplicatesServices.level(_level_id, name);
    res.status(201).json(duplicate);
  } catch (error) {
    next(error);
  }
};

export const duplicateSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _level_id = parseInt(id);
    const { name } = req.body;
    const duplicate = await DuplicatesServices.subTask(_level_id, name);
    res.status(201).json(duplicate);
  } catch (error) {
    next(error);
  }
};
