import { Response, Request, NextFunction } from 'express';
import {
  StageServices,
  _dirPath,
  _editablePath,
  _materialPath,
  _reviewPath,
} from '../services';
import { mkdirSync, rmSync } from 'fs';
import { SubTasks } from '@prisma/client';

const dir = _dirPath;
const model = _materialPath;
const review = _reviewPath;
const editables = _editablePath;

const createfiles = (list: string[], rootPath: string) => {
  list.forEach(path => mkdirSync(`${path}/${rootPath}`));
};

// const uploadFiles = (list: string[], oldPath: string, newPath: string) => {
//   list.forEach(path => renameDir(`${path}/${oldPath}`, `${path}/${newPath}`));
// };

const deleteFiles = (list: string[], rootPath: string) => {
  list.forEach(path => rmSync(`${path}/${rootPath}`, { recursive: true }));
};

export const showListStages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await StageServices.findMany(1);
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const showStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _stage_id = parseInt(id);
    const status = req.query.status as SubTasks['status'];
    const query = await StageServices.find(_stage_id, status);
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
    const { project, ...query } = await StageServices.create(body);
    const { id } = project;
    const path = id + '/' + query.id;
    if (query) createfiles([model, dir, review, editables], path);
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
    // const oldStage = await StageServices.findShort(_stage_id);
    const query = await StageServices.update(_stage_id, body);
    // const oldStagePath = project.name + '/' + oldStage.name;
    // const newStagePath = project.name + '/' + query.name;
    // uploadFiles([model, dir, review, editables], oldStagePath, newStagePath);
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
    const { project, ...query } = await StageServices.delete(_stage_id);
    const path = project.name + '/' + query.name;
    if (query) deleteFiles([model, dir, review, editables], path);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
