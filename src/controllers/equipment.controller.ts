import { NextFunction, Request, Response } from 'express';
import { EquipmentServices } from '../services';
import AppError from '../utils/appError';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export const createEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { file } = req.files as FilesProps;
    const { body } = req;
    const query = await EquipmentServices.createEquipment({
      ...body,
      userId: +body.userId,
      workStationId: +body.workStationId,
      doc: file[0].filename,
    });
    res.status(201).json(query);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await EquipmentServices.getEquipment(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await EquipmentServices.updateEquipment(+id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await EquipmentServices.deleteEquipment(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
