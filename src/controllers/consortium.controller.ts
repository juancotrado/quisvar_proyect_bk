import { NextFunction, Request, Response } from 'express';
import { ConsortiumServices } from '../services';

export const createConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const query = await ConsortiumServices.create(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getAllConsortium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await ConsortiumServices.getAllConsortium();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getConsortiumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ConsortiumServices.getConsortiumById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const query = await ConsortiumServices.updateById(+id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await ConsortiumServices.deleteById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
