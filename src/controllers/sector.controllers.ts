import { NextFunction, Request, Response } from 'express';
import { SectorServices } from '../services';

export const showSectors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await SectorServices.getAll();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

// export const showSpeciality = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const { id } = req.params;
//       const project_id = parseInt(id);
//       const query = await SectorServices.find(project_id);
//       res.status(200).json(query);
//     } catch (error) {
//       next(error);
//     }
//   };

export const createSector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const createNewProject = await SectorServices.create(body);
    res.status(201).json(createNewProject);
  } catch (error) {
    next(error);
  }
};

export const updateSector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const sector_id = parseInt(id);
    const query = await SectorServices.update(sector_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteSector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sector_id = parseInt(id);
    const query = await SectorServices.delete(sector_id);
    res.status(204).json(query);
  } catch (error) {
    next(error);
  }
};
