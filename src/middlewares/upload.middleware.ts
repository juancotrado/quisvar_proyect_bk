import { Files } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { FilesServices, PathServices } from '../services';
import AppError from '../utils/appError';
import { existsSync, mkdirSync } from 'fs';
import { TypeFileUser } from 'types/types';

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
const storageFileUser = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFileUser = req.query.typeFile as TypeFileUser;
    const uploadPath = `public/${typeFileUser}`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, files, cb) {
    const { originalname } = files;
    cb(null, Date.now() + '$$' + originalname);
  },
});
const storageGeneralFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = `public/general`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '$' + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
});

export const uploadFileUser = multer({
  storage: storageFileUser,
});
export const uploadGeneralFiles = multer({
  storage: storageGeneralFiles,
});

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    next(error);
  }
};
