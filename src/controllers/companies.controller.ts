import { NextFunction, Request, Response } from 'express';
import { CompaniesServices } from '../services';
import { FilesProps } from 'types/types';
import AppError from '../utils/appError';
// import { unlinkSync } from 'fs';

class CompanyController {
  public static async updateImg(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.file) throw new AppError('No existe imagen', 404);
      const { filename } = req.file as Express.Multer.File;
      const image = filename;
      const query = await CompaniesServices.updateImg(image, +id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteImg(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const query = await CompaniesServices.deleteImg(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  }
}
export default CompanyController;

export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { img } = req.files as FilesProps;
    const query = await CompaniesServices.createCompany({
      ...body,
      img: img ? img[0].filename : '',
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
export const updateCompaniesById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await CompaniesServices.updateCompaniesById(+id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
//COMPANIES IMG
