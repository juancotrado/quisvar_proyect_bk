import { NextFunction, Request, Response } from 'express';
import { EquipmentServices, WorkStationServices } from '../services';
import AppError from '../utils/appError';
import { WorkStation } from '@prisma/client';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export const createWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { file } = req.files as FilesProps;
    const body = req.body as WorkStation;
    const query = await WorkStationServices.createWorkStation({
      ...body,
      total: +body.total,
      doc: file[0].filename,
    });
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const getWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await WorkStationServices.getWorkStation();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await WorkStationServices.updateWorkStation(+id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await WorkStationServices.deleteWorkStation(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
