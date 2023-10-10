import { NextFunction, Request, Response } from 'express';
import { CompaniesServices } from '../services';

export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await CompaniesServices.createCompany(body);
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
