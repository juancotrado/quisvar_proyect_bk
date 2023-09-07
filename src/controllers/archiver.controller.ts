import { NextFunction, Request, Response } from 'express';
import { PathLevelServices, PathServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import fs from 'fs';

const TYPE_PATH = {
  // routes: PathServices.pathArea,
  projects: PathLevelServices.pathProject,
  levels: PathLevelServices.pathLevel,
  stages: PathLevelServices.pathStage,
  // indextasks: PathServices.pathIndexTask,
  // tasks: PathServices.pathTask,
  // tasks2: PathServices.pathTask2,
  // tasks3: PathServices.pathTask3,
};
export const archiverPath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const type = req.query.type as keyof typeof TYPE_PATH;
    const TypePathServices = TYPE_PATH[type];
    const path = await TypePathServices(+id, 'UPLOADS');
    const folderPath = path.slice(2);
    const zipFilePath = `${path}.zip`;
    const resArchiver = await archiverFolder(folderPath, zipFilePath);
    res.status(201).json({
      result: resArchiver,
      url: zipFilePath,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArchiver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { path } = req.query;
    fs.unlinkSync(`${path}`);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
