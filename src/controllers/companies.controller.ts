import { NextFunction, Request, Response } from 'express';
import { CompaniesServices } from '../services';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };

export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { img } = req.files as FilesProps;
    console.log(img[0].filename);
    console.log('aqui');
    const query = await CompaniesServices.createCompany({
      ...body,
      img: img[0].filename ?? '',
    });
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await CompaniesServices.getCompanies();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getCompaniesById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await CompaniesServices.getCompaniesById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
