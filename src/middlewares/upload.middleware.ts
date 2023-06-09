import { Files } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { FilesServices, PathServices } from '../services';
import AppError from '../utils/appError';

const MAX_SIZE = Infinity;
const FILE_TYPES = ['.rar', '.zip'];

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      const { id } = req.params;
      const _subtask_id = parseInt(id);
      const status = req.query.status as Files['type'];
      const path = await PathServices.pathSubTask(_subtask_id, status);
      callback(null, path);
    } catch (error) {
      callback(new AppError(`No se pudo encontrar la ruta`, 404), '');
    }
  },
  filename: async (req, file, callback) => {
    try {
      const { id } = req.params;
      const _subtask_id = parseInt(id);
      const { item, name } = await FilesServices.getSubTask(_subtask_id);
      const uniqueSuffix = Date.now();
      // if (typeSubTask === 'REVIEW') {
      //   const files = await FilesServices.findBySubTask(
      //     _subtask_id,
      //     typeSubTask
      //   );
      //   const filesList = files.map(f => '.' + f.name.split('.').at(-1));
      //   if (filesList.includes(extName)) throw new Error();
      // }
      callback(
        null,
        item + '.' + name + '@' + uniqueSuffix + '$' + file.originalname
      );
    } catch (error) {
      callback(
        new AppError(`Oops! , envie archivos con extension no repetida`, 404),
        ''
      );
    }
    // callback(null, _subtask_id + '-' + uniqueSuffix + '@' + file.originalname);
  },
});

const checkFileType = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const extName = path.extname(file.originalname);
  if (FILE_TYPES.includes(extName)) return callback(null, true);
  return callback(new Error('Suba el archivo con la extension solicitada!'));
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
  // fileFilter: checkFileType,
});

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    next(error);
  }
};
