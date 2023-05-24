import { NextFunction, Request, Response } from 'express';
import { WorkAreasServices } from '../services';

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

export const createWorkArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await WorkAreasServices.create(body);
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
    const query = await WorkAreasServices.update(_work_area_id, body);
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
    const query = await WorkAreasServices.delete(_work_area_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
