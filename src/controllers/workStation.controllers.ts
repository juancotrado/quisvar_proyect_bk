import { NextFunction, Request, Response } from 'express';
import { WorkStationServices } from '../services';
export const createWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await WorkStationServices.createWorkStation(body);
    res.status(201).json(query);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await WorkStationServices.getWorkStation();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await WorkStationServices.updateWorkStation(+id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteWorkStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await WorkStationServices.deleteWorkStation(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
