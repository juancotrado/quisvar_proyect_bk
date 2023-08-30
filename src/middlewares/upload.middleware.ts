import { Files } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { FilesServices, PathServices } from '../services';
import AppError from '../utils/appError';

const MAX_SIZE = 1024 * 1000 * 1000 * 1000;
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
  },
});
const storageContract = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/contracts');
  },
  filename: function (req, file, cb) {
    const { id } = req.params;
    console.log(file);
    const { originalname } = file;
    cb(null, id + originalname);
  },
});
export const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
});

export const uploadContrac = multer({
  storage: storageContract,
});
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    next(error);
  }
};
