import { NextFunction, Request, Response } from 'express';
import { AreaSpecialtyServices } from '../services';
import AppError from '../utils/appError';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export const createAreaSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { file } = req.files as FilesProps;
    const { body } = req;
    const query = await AreaSpecialtyServices.createAreaSpecialty({
      ...body,
      file: file[0].filename,
    });
    res.status(201).json(query);
  } catch (error) {
    console.log(error);

    next(error);
  }
};
export const getAreaSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await AreaSpecialtyServices.getAreaSpecialty(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
