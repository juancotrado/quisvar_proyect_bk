import type { Request, Response, NextFunction } from 'express';
import { DuplicatesServices, _materialPath, _reviewPath } from '../services';
import { cpSync, mkdirSync } from 'fs';

export const duplicateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _project_id = parseInt(id);
    const duplicate = await DuplicatesServices.project(_project_id);

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
    const duplicate = await DuplicatesServices.stage(_stage_id);
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
    // const oldDir = await PathLevelServices.pathLevel(_level_id);
    const duplicate = await DuplicatesServices.level(_level_id);
    // if (duplicate) mkdirSync(newPath);
    res.status(201).json(duplicate);
  } catch (error) {
    next(error);
  }
};
