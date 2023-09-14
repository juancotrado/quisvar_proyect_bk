import { NextFunction, Request, Response } from 'express';
import { LevelsServices, PathLevelServices } from '../services';
import { mkdirSync, rmSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

export const showLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _task_id = parseInt(id);
    const query = await LevelsServices.find(_task_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await LevelsServices.create(body);
    const path = await PathLevelServices.pathLevel(query.id);
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
    const newPath = setNewPath(oldPath, query.item + query.name);
    const oldEditable = oldPath.replace('projects', 'editables');
    const newEditable = newPath.replace('projects', 'editables');
    if (query) {
      renameDir(oldPath, newPath);
      renameDir(oldEditable, newEditable);
    }
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
    if (query) rmSync(query, { recursive: true });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
