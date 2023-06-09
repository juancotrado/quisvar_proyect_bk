import { NextFunction, Request, Response, query } from 'express';
import { PathServices, ProjectsServices } from '../services';
import { rmSync, mkdirSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

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
    const path = await PathServices.pathProject(query.id);
    if (query) {
      mkdirSync(path);
      mkdirSync(`./file_model/${query.name}`);
      mkdirSync(`./file_review/${query.name}`);
    }
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
    const oldDir = await PathServices.pathProject(_project_id);
    const project = await ProjectsServices.findShort(_project_id);
    const query = await ProjectsServices.update(_project_id, body);
    const newDir = setNewPath(oldDir, query.name);
    if (query) {
      renameDir(oldDir, newDir);
      renameDir(`./file_model/${project.name}`, `./file_model/${query.name}`);
      renameDir(`./file_review/${project.name}`, `./file_review/${query.name}`);
    }
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
    const path = await PathServices.pathProject(project_id);
    const query = await ProjectsServices.delete(project_id);
    if (query) rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
