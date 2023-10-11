import { NextFunction, Request, Response } from 'express';
import { SpecialistServices } from '../services';
import AppError from '../utils/appError';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export const createSpecialist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { fileAgreement, fileCv } = req.files as FilesProps;
    const { body } = req;
    const query = await SpecialistServices.createSpecialist({
      ...body,
      cv: fileCv[0].filename,
      agreement: fileAgreement[0].filename,
    });
    res.status(201).json(query);
  } catch (error) {
    console.log(error);

    next(error);
  }
};
export const getSpecialist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await SpecialistServices.getSpecialist();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getSpecialistByDNI = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dni } = req.params;
    const query = await SpecialistServices.getSpecialistByDNI(dni);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
