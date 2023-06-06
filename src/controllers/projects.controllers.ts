import { NextFunction, Request, Response, query } from 'express';
import { ProjectsServices } from '../services';
import fs, { mkdir, mkdirSync } from 'fs';

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
    const createNewProject = await ProjectsServices.create(body);
    if (createNewProject) {
      mkdirSync(createNewProject.dir);
    }
    res.status(201).json(createNewProject);
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
    const oldDir = (await ProjectsServices.find(_project_id)).dir;
    const query = await ProjectsServices.update(_project_id, body);
    if (oldDir && query) {
      fs.renameSync(oldDir, `${query.dir}`);
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
    const query = await ProjectsServices.delete(project_id);
    if (query) {
      fs.rmSync(query.dir, { recursive: true });
    }
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
