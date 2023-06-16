import { NextFunction, Request, Response } from 'express';
import { PathServices, ProjectsServices, WorkAreasServices } from '../services';
import fs from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

export const showWorkArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _work_area_id = parseInt(id);
    const query = await WorkAreasServices.find(_work_area_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showReviewList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _user_id = parseInt(id);
    const query = await WorkAreasServices.getReviewfromUser(_user_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createWorkArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await WorkAreasServices.create(body);
    const path = await PathServices.pathArea(query.id);
    if (query) fs.mkdirSync(path);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateWorkarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const _work_area_id = parseInt(id);
    console.log(body, id);
    const oldDir = await PathServices.pathArea(_work_area_id);
    const query = await WorkAreasServices.update(_work_area_id, body);
    const path = query.item ? query.name : query.item + '.' + query.name;
    const newDir = setNewPath(oldDir, path);
    if (query) renameDir(oldDir, newDir);
    res.status(200).json({ ...query, newDir });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _work_area_id = parseInt(id);
    const { projectId } = await WorkAreasServices.find(_work_area_id);
    const path = await PathServices.pathArea(_work_area_id);
    const query = await WorkAreasServices.delete(_work_area_id, projectId);
    if (query) fs.rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
