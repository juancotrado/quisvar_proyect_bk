import { NextFunction, Request, Response } from 'express';
import { CompaniesServices } from '../services';
// import { unlinkSync } from 'fs';
type FilesProps = { [fieldname: string]: Express.Multer.File[] };

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
export const updateImgCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { img } = req.files as FilesProps;
    const image = img ? img[0].filename : '';
    const query = await CompaniesServices.updateImg(image, +id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteImgCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await CompaniesServices.deleteImg(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
