import { NextFunction, Request, Response, query } from 'express';
import {
  PathServices,
  ProjectsServices,
  _materialPath,
  _reviewPath,
} from '../services';
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

export const showProjectByPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project_id = parseInt(id);
    const query = await ProjectsServices.getByPrice(project_id);
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
    const projectName = query.name;
    if (query) {
      mkdirSync(path);
      mkdirSync(`./${_materialPath}/${projectName}`);
      mkdirSync(`./${_reviewPath}/${projectName}`);
      if (query.unique) {
        const pathArea = await PathServices.pathArea(query.workAreaId);
        mkdirSync(pathArea);
      }
    }

    res.status(201).json(query);
  } catch (error) {
    console.log(error);
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
    const oldNameProject = project.name;
    const nameProject = query.name;
    const newDir = setNewPath(oldDir, nameProject);
    if (query) {
      renameDir(oldDir, newDir);
      renameDir(
        `./${_materialPath}/${oldNameProject}`,
        `./${_materialPath}/${nameProject}`
      );
      renameDir(
        `./${_reviewPath}/${oldNameProject}`,
        `./${_reviewPath}/${nameProject}`
      );
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
    const nameProject = query.name;
    if (query) {
      rmSync(path, { recursive: true });
      rmSync(`${_materialPath}/${nameProject}`, { recursive: true });
      rmSync(`${_reviewPath}/${nameProject}`, { recursive: true });
    }
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
