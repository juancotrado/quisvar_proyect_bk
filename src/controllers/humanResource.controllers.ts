import { Request, Response, NextFunction } from 'express';
import { ResourceHumanServices } from '../services';
import AppError from '../utils/appError';
import { ReportByUserPick } from 'types/types';

export const showReportsBySupervisor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _supervisor_id = parseInt(id);
    const query = await ResourceHumanServices.viewReports(_supervisor_id);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
export const createReportByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const body = req.body as ReportByUserPick;
    const file = req.file as Express.Multer.File;
    const { filename } = file;
    const query: ReportByUserPick = {
      userId: +body.userId,
      supervisorId: +body.supervisorId,
      name: filename,
    };
    const result = await ResourceHumanServices.newReport(query);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
