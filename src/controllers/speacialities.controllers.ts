import { NextFunction, Request, Response } from 'express';
import { SpecialitiesServices } from '../services';

export const showSpecialities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await SpecialitiesServices.getAll();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const showSpeciality = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project_id = parseInt(id);
    const query = await SpecialitiesServices.find(project_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createSpeciality = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const createNewProject = await SpecialitiesServices.create(body);
    res.status(201).json(createNewProject);
  } catch (error) {
    next(error);
  }
};

export const updateSpeciality = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _project_id = parseInt(id);
    const query = await SpecialitiesServices.update(_project_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteSpeciality = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project_id = parseInt(id);
    const query = await SpecialitiesServices.delete(project_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
