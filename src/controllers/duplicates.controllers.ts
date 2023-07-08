import type { Request, Response, NextFunction } from 'express';
import {
  DuplicatesServices,
  PathServices,
  _materialPath,
  _reviewPath,
} from '../services';
import { cpSync } from 'fs';

export const duplicateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _project_id = parseInt(id);
    const duplicate = await DuplicatesServices.proyect(_project_id);
    const oldPath = await PathServices.pathProject(_project_id);
    const newPath = await PathServices.pathProject(duplicate.id);
    if (duplicate) {
      cpSync(oldPath, newPath, { recursive: true });
      cpSync(
        `${_materialPath}/${duplicate.oldName}`,
        `${_materialPath}/${duplicate.name}`,
        {
          recursive: true,
        }
      );
      cpSync(
        `${_reviewPath}/${duplicate.oldName}`,
        `${_reviewPath}/${duplicate.name}`,
        {
          recursive: true,
        }
      );
    }
    res.status(201).json({ oldPath, newPath });
  } catch (error) {
    next(error);
  }
};
