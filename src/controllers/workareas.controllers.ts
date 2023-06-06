import { NextFunction, Request, Response } from 'express';
import { ProjectsServices, WorkAreasServices } from '../services';
import fs from 'fs';
// export const showWorkareas = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const query = await WorkAreasServices.getAll();
//     res.status(200).json(query);
//   } catch (error) {
//     next(error);
//   }
// };
const path = './uploads';
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
    const project = await ProjectsServices.find(body.projectId);
    const query = await WorkAreasServices.create(body, project.dir);
    if (project && query) {
      const newDir = query.dir + '/' + query.item + '.' + query.name;
      fs.mkdirSync(newDir);
    }
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
    const oldTask = await WorkAreasServices.find(_work_area_id);
    const query = await WorkAreasServices.update(_work_area_id, body);
    if (query) {
      const oldDir = oldTask.dir + '/' + oldTask.item + '.' + oldTask.name;
      const newDir = query.dir + '/' + query.item + '.' + query.name;
      fs.renameSync(oldDir, newDir);
    }
    res.status(200).json(query);
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
    const _project_id = (await WorkAreasServices.find(_work_area_id)).projectId;
    const query = await WorkAreasServices.delete(_work_area_id, _project_id);
    if (query) {
      const path = query.dir + '/' + query.item + '.' + query.name;
      fs.rmSync(path, { recursive: true });
    }
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
