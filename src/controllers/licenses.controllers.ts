import { NextFunction, Request, Response } from 'express';
import { LicenseServices } from '../services';
import { LicensesStatus } from '@prisma/client';

export const createLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const query = await LicenseServices.create(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const query = await LicenseServices.update(Number(id), body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getLicenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const id = req.params.id;
    // const status = req.query.status as LicensesStatus;
    const query = await LicenseServices.getLicenceById();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
