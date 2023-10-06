import { NextFunction, Request, Response } from 'express';
import { PathServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import fs from 'fs';

const TYPE_PATH = {
  projects: PathServices.project,
  levels: PathServices.level,
  stages: PathServices.stage,
};

export const archiverPath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nameZip } = req.query;
    const type = req.query.type as keyof typeof TYPE_PATH;
    const TypePathServices = TYPE_PATH[type];

    const path = await TypePathServices(+id, 'UPLOADS');
    const normalicePath = path.split('/').slice(0, -1).join('/');
    const folderPath = path.slice(2);
    const zipFilePath = `${normalicePath}/${nameZip ?? 'defaultName'}.zip`;
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
