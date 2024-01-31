import { NextFunction, Request, Response } from 'express';
import { LevelsServices, PathServices } from '../services';
import { mkdirSync, rmSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';
import { Levels, SubTasks } from '@prisma/client';
import { ControllerFunction } from 'types/patterns';
// import mv from 'mv';

export const showLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const status = req.query.status as SubTasks['status'];
    const _task_id = parseInt(id);
    const query = await LevelsServices.find(_task_id, status);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

class LevelsControllers {
  public static addToUp: ControllerFunction = async (req, res, next) => {
    try {
      const { id: subtask_id, stageId } = req.params;
      const type = req.query.type as 'upper' | 'lower';
      const { body } = req;
      const query = await LevelsServices.addToUper(
        +subtask_id,
        { ...body },
        type
      );
      // const query = await StageServices.find(+stageId);
      // const query = { pat: 'pat' };
      res.status(201).json({ ...query, stagesId: stageId });
    } catch (error) {
      next(error);
    }
  };
}

export default LevelsControllers;

export const createLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await LevelsServices.create(body);
    const path = await PathServices.level(query.id);
    const editablePath = path.replace('projects', 'editables');
    if (query) {
      mkdirSync(path);
      mkdirSync(editablePath);
    }
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _task_id = parseInt(id);
    const { oldPath, ...query } = await LevelsServices.update(_task_id, body);
    if (query && query.item && query.name) {
      const newPath = setNewPath(oldPath, query.item + query.name);
      const oldEditable = oldPath.replace('projects', 'editables');
      const newEditable = newPath.replace('projects', 'editables');
      // mv(oldPath, newPath, err => console.log(err));
      renameDir(oldPath, newPath);
      renameDir(oldEditable, newEditable);
    }
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateTypeItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const item = req.query.item as Levels['typeItem'];
    const type = req.query.type as 'STAGE' | 'LEVEL';
    const isArea = req.query.isArea === 'true';
    const _task_id = parseInt(id);
    const query = await LevelsServices.updateTypeItem(
      _task_id,
      item,
      isArea,
      type
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await LevelsServices.delete(_task_id);
    const editables = query.replace('projects', 'editables');
    if (query) {
      rmSync(query, { recursive: true });
      rmSync(editables, { recursive: true });
    }
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
