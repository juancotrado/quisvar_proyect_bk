import { NextFunction, Request, Response } from 'express';
import { PathServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import fs from 'fs';

const TYPE_PATH = {
  routes: PathServices.pathArea,
  projects: PathServices.pathProject,
  indextasks: PathServices.pathIndexTask,
  tasks: PathServices.pathTask,
  tasks2: PathServices.pathTask2,
  tasks3: PathServices.pathTask3,
};
export const archiverPath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const type = req.query.type as keyof typeof TYPE_PATH;
    if (!TYPE_PATH[type]) return;
    const TypePathServices = TYPE_PATH[type];
    const path = await TypePathServices(+id);
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
