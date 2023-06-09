import { NextFunction, Request, Response, query } from 'express';
import { PathServices, ProjectsServices } from '../services';
import fs, { mkdir, mkdirSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

const path = './uploads';

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
    // fs.mkdirSync('uploads/onichan/gozu de mierda');
    // fs.writeFileSync('./uploads/onichan/gozudemierda/diegodemrd.txt', 'w');
    // fs.renameSync('uploads/patito', 'uploads/onichan');
    // fs.rmSync('./uploads/onichan', { recursive: true ,});
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
    if (query) mkdirSync(query.dir);
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
    const query = await ProjectsServices.update(_project_id, body);
    const newDir = setNewPath(oldDir, query.name);
    if (query) renameDir(oldDir, newDir);
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
    if (query) fs.rmSync(path, { recursive: true });
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
