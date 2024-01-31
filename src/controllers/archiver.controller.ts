import { NextFunction, Request, Response } from 'express';
import { PathServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import fs from 'fs';
import { removeUnwantedCharacters } from '../utils/tools';

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
    const { nameZip, typeZip } = req.query;
    const type = req.query.type as keyof typeof TYPE_PATH;
    const TypePathServices = TYPE_PATH[type];

    const path = await TypePathServices(+id, 'UPLOADS');
    const pathReplace = path.replace('projects', typeZip as string);
    const normalicePath = pathReplace.split('/').slice(0, -1).join('/');
    const folderPath = pathReplace.slice(2);
    const normalizeName = removeUnwantedCharacters(nameZip as string);
    const zipFilePath = `${normalicePath}/${
      normalizeName ?? 'defaultName'
    }.zip`;
    const resArchiver = await archiverFolder(folderPath, zipFilePath);
    res.status(201).json({
      result: resArchiver,
      urlFile: zipFilePath.replace('./uploads/', ''),
      urlFileDelete: zipFilePath,
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
