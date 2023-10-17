import { NextFunction, Request, Response } from 'express';
import { TrainingSpecialtyServices } from '../services';
import AppError from '../utils/appError';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export const createTrainingSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { trainingFile } = req.files as FilesProps;
    const { body } = req;
    const query = await TrainingSpecialtyServices.createTrainingSpecialty({
      ...body,
      trainingFile: trainingFile[0].filename,
    });
    res.status(201).json(query);
  } catch (error) {
    console.log(error);

    next(error);
  }
};
export const getTrainingSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await TrainingSpecialtyServices.getTrainingSpecialty(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
