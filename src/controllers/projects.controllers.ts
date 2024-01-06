import { NextFunction, Request, Response } from 'express';
import {
  PathServices,
  ProjectsServices,
  _editablePath,
  _materialPath,
  _reviewPath,
} from '../services';
import { rmSync, mkdirSync, existsSync } from 'fs';
import AppError from '../utils/appError';

const model = _materialPath;
const review = _reviewPath;
const editables = _editablePath;

const createFolders = () => {
  const project = existsSync(`uploads/projects`);
  const model = existsSync(`uploads/models`);
  const review = existsSync(`uploads/reviews`);
  const editables = existsSync(`uploads/editables`);
  if (!project) mkdirSync(`uploads/projects`);
  if (!model) mkdirSync(`uploads/models`);
  if (!review) mkdirSync(`uploads/reviews`);
  if (!editables) mkdirSync(`uploads/editables`);
};

export const showProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await ProjectsServices.getAll();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project_id = parseInt(id);
    const query = await ProjectsServices.find(project_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await ProjectsServices.create(body);
    const path = await PathServices.project(query.id, 'UPLOADS');
    const projectName = query.id;
    createFolders();
    mkdirSync(path);
    mkdirSync(`${model}/${projectName}`);
    mkdirSync(`${review}/${projectName}`);
    mkdirSync(`${editables}/${projectName}`);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _project_id = parseInt(id);
    const oldDir = await PathServices.project(_project_id, 'UPLOADS');
    if (!existsSync(oldDir))
      throw new AppError('No se pudo editar el projecto', 400);
    // const oldName = oldDir.split('/').at(-1);
    const query = await ProjectsServices.update(_project_id, body);
    // const { name } = query;
    // const newDir = setNewPath(oldDir, name);
    // if (query) {
    //   renameDir(oldDir, newDir);
    //   renameDir(`${model}/${oldName}`, `${model}/${name}`);
    //   renameDir(`${review}/${oldName}`, `${review}/${name}`);
    //   renameDir(`${editables}/${oldName}`, `${editables}/${name}`);
    // }
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project_id = parseInt(id);
    const {
      name,
      id: projectId,
      path,
      ...query
    } = await ProjectsServices.delete(project_id);
    rmSync(path, { recursive: true });
    rmSync(`${model}/${projectId}`, { recursive: true });
    rmSync(`${review}/${projectId}`, { recursive: true });
    rmSync(`${editables}/${projectId}`, { recursive: true });
    res.status(204).json({ name, path, ...query });
  } catch (error) {
    next(error);
  }
};
