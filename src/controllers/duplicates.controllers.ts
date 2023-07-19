import type { Request, Response, NextFunction } from 'express';
import {
  DuplicatesServices,
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
    const oldPath = await PathServices.pathProject(_project_id);
    const newPath = await PathServices.pathProject(duplicate.id);
    if (duplicate) {
      cpSync(oldPath, newPath, { recursive: true });
      cpSync(
        `${_materialPath}/${duplicate.oldName}`,
        `${_materialPath}/${duplicate.newName}`,
        {
          recursive: true,
        }
      );
      cpSync(
        `${_reviewPath}/${duplicate.oldName}`,
        `${_reviewPath}/${duplicate.newName}`,
        {
          recursive: true,
        }
      );
    }
    res.status(201).json({ oldPath, newPath });
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
    const { id } = req.params;
    const { stage } = req.body;
    const _project_id = parseInt(id);
    const _stage_id = parseInt(stage);
    const duplicate = await DuplicatesServices.project(_project_id, _stage_id);
    const oldPath = await PathServices.pathProject(_project_id);
    const newPath = await PathServices.pathProject(duplicate.id);
    if (duplicate) {
      cpSync(oldPath, newPath, { recursive: true });
      cpSync(
        `${_materialPath}/${duplicate.oldName}`,
        `${_materialPath}/${duplicate.newName}`,
        {
          recursive: true,
        }
      );
      cpSync(
        `${_reviewPath}/${duplicate.oldName}`,
        `${_reviewPath}/${duplicate.newName}`,
        {
          recursive: true,
        }
      );
    }
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};

export const duplicateArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _work_area_id = parseInt(id);
    const duplicate = await DuplicatesServices.area(_work_area_id);
    const oldPath = await PathServices.pathArea(_work_area_id);
    const newPath = await PathServices.pathArea(duplicate.id);
    if (duplicate) mkdirSync(newPath);
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};

export const duplicateIndexTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _index_task_id = parseInt(id);
    const duplicate = await DuplicatesServices.indexTask(_index_task_id);
    const oldPath = await PathServices.pathIndexTask(_index_task_id);
    const newPath = await PathServices.pathIndexTask(duplicate.id);
    if (duplicate) mkdirSync(newPath);
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};
export const duplicateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const duplicate = await DuplicatesServices.task(_task_id);
    const oldPath = await PathServices.pathTask(_task_id);
    const newPath = await PathServices.pathTask(duplicate.id);
    if (duplicate) mkdirSync(newPath);
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};
export const duplicateTask2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_2_id = parseInt(id);
    const duplicate = await DuplicatesServices.task2(_task_2_id);
    const oldPath = await PathServices.pathTask2(_task_2_id);
    const newPath = await PathServices.pathTask2(duplicate.id);
    if (duplicate) mkdirSync(newPath);
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};
export const duplicateTask3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_3_id = parseInt(id);
    const duplicate = await DuplicatesServices.task3(_task_3_id);
    const oldPath = await PathServices.pathTask3(_task_3_id);
    const newPath = await PathServices.pathTask3(duplicate.id);
    if (duplicate) mkdirSync(newPath);
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};
