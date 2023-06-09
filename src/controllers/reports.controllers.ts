import { Request, Response, NextFunction } from 'express';
import { ReportsServices } from '../services';
import AppError from '../utils/appError';
import { UserType } from '../middlewares/auth.middleware';
import { indexTemplate } from '../templates/index.template';

export const showListReportByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { id } = req.params;
    // const _user_id = parseInt(id);
    const userInfo: UserType = res.locals.userInfo;
    const { id } = userInfo;
    const initial = req.query.initial as string;
    const until = req.query.until as string;
    const startDate = new Date(initial);
    const untilDate = new Date(until);
    if (!startDate || !untilDate)
      throw new AppError('Ingrese Fechas validas', 400);
    const query = await ReportsServices.getReportByUser(
      id,
      startDate,
      untilDate
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const generateIndex = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _project_id = parseInt(id);
    const query = await ReportsServices.index(_project_id);
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline;filename=index/${_project_id}.pdf`,
    });
    indexTemplate(
      (chunk: any) => stream.write(chunk),
      () => stream.end(),
      query
    );
    // res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
