import { NextFunction, Request, Response } from 'express';
import { LicenseServices } from '../services';
import { LicensesStatus } from '@prisma/client';

export const createLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await LicenseServices.create(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const createFreeForAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await LicenseServices.createFreeForAll(body);
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
export const approveLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const query = await LicenseServices.updateApprove(Number(id), body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateCheckOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const query = await LicenseServices.updateCheckOut(Number(id), body);
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
    // const query = await LicenseServices.deleteExpiredLicenses();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getLicensesByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const id = req.params.id;
    const { page, pageSize, status } = req.query;
    const query = await LicenseServices.getLicensesByStatus(
      status as LicensesStatus,
      +(page as string),
      +(pageSize as string)
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getLicensesEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page, pageSize, status } = req.query;
    const query = await LicenseServices.getLicensesEmployee(
      Number(id),
      status as LicensesStatus,
      +(page as string),
      +(pageSize as string)
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getLicensesFee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const query = await LicenseServices.getLicensesFee(
      startDate as string,
      endDate as string,
      Number(id)
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const expiredLicenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await LicenseServices.deleteExpiredLicenses();
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const activeLicenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await LicenseServices.activeLicenses();
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await LicenseServices.deleteLicense(Number(id));
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
