import { NextFunction, Request, Response } from 'express';
import { ListServices } from '../services';
import AppError from '../utils/appError';

export const createList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const query = await ListServices.create(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const query = await ListServices.update(Number(id), body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const userAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const query = await ListServices.assignedUser(Number(id), body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, status } = req.body;
    const { id } = req.params;
    const query = await ListServices.updateStatusByUser(
      userId,
      Number(id),
      status
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getListById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ListServices.getListById(Number(id));
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getAllListByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate as string;
    const query = await ListServices.getAllListByDate(startDate);
    res.status(200).json(query);
  } catch (error) {
    console.log(error);

    next(error);
  }
};
export const getListRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const query = await ListServices.getListRange(startDate, endDate);
    res.status(200).json(query);
  } catch (error) {
    console.log(error);

    next(error);
  }
};
