import type { Request, Response, NextFunction } from 'express';
import {
  DuplicatesServices,
  PathLevelServices,
  PathServices,
  _materialPath,
  _reviewPath,
} from '../services';
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
    // const newPath = await PathServices.pathProject(duplicate.id);
    // if (duplicate) {
    //   cpSync(oldPath, newPath, { recursive: true });
    //   cpSync(
    //     `${_materialPath}/${duplicate.oldName}`,
    //     `${_materialPath}/${duplicate.newName}`,
    //     {
    //       recursive: true,
    //     }
    //   );
    //   cpSync(
    //     `${_reviewPath}/${duplicate.oldName}`,
    //     `${_reviewPath}/${duplicate.newName}`,
    //     {
    //       recursive: true,
    //     }
    //   );
    // }
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
    // const { id } = req.params;
    // const { stage } = req.body;
    // const _project_id = parseInt(id);
    // const _stage_id = parseInt(stage);
    // const duplicate = await DuplicatesServices.project(_project_id, _stage_id);
    // const oldPath = await PathServices.pathProject(_project_id);
    // const newPath = await PathServices.pathProject(duplicate.id);
    // console.log(oldPath, newPath);
    // if (duplicate) {
    //   cpSync(oldPath, newPath, { recursive: true });
    //   cpSync(
    //     `${_materialPath}/${duplicate.oldName}`,
    //     `${_materialPath}/${duplicate.newName}`,
    //     {
    //       recursive: true,
    //     }
    //   );
    //   cpSync(
    //     `${_reviewPath}/${duplicate.oldName}`,
    //     `${_reviewPath}/${duplicate.newName}`,
    //     {
    //       recursive: true,
    //     }
    //   );
    // }
    // res.status(201).json({ oldPath, newPath });
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
