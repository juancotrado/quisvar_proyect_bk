import { Files } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { PathServices, _contractPath } from '../services';
import AppError from '../utils/appError';
import { existsSync, mkdirSync } from 'fs';
import { TypeFileUser } from 'types/types';

const MAX_SIZE = 1024 * 1000 * 1000 * 1000;
// const FILE_TYPES = ['.rar', '.zip'];

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      const { id } = req.params;
      const _subtask_id = parseInt(id);
      const status = req.query.status as Files['type'];
      const path = await PathServices.subTask(_subtask_id, status);
      callback(null, path);
    } catch (error) {
      callback(new AppError(`No se pudo encontrar la ruta`, 404), '');
    }
  },
  filename: async (req, file, callback) => {
    try {
      // const { id } = req.params;
      // const _subtask_id = parseInt(id);
      // const { item, name } = await FilesServices.getSubTask(_subtask_id);
      const uniqueSuffix = Date.now();
      const { originalname } = file;
      if (originalname.includes('$')) throw new Error();
      callback(null, uniqueSuffix + '$' + file.originalname);
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
const storageFileSpecialist = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/cv';
    if (file.fieldname === 'fileAgreement') {
      uploadPath = `public/agreement`;
    }
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
const storageAreaSpecialty = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/specialty';
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

const storageAddWorkStation = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/workStation';
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

const storageAddEquipment = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('here');
    let uploadPath = 'public/equipment';
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

const storageTrainingSpecialty = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/training';
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

const storageFileMail = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      const uploadPath = `public/mail`;
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    } catch (error) {
      callback(new AppError(`Oops! ,no existe la ruta`, 404), '');
    }
  },
  filename: (req, file, callback) => {
    try {
      const uniqueSuffix = Date.now();
      const { originalname } = file;
      if (originalname.includes('$')) throw new Error();
      const nameFile = uniqueSuffix + '$' + originalname;
      callback(null, nameFile);
    } catch (error) {
      callback(new AppError(`Oops! , archivo contiene "$"`, 404), '');
    }
  },
});

const storageFileVoucher = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      const uploadPath = `public/voucher`;
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      callback(null, uploadPath);
    } catch (error) {
      callback(new AppError(`Oops! ,no existe la ruta`, 404), '');
    }
  },
  filename: (req, file, callback) => {
    try {
      const uniqueSuffix = Date.now();
      const { originalname } = file;
      if (originalname.includes('$')) throw new Error();
      const nameFile = uniqueSuffix + '$' + originalname;
      callback(null, nameFile);
    } catch (error) {
      callback(new AppError(`Oops! , archivo contiene "$"`, 404), '');
    }
  },
});

const storageReportUser = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = `public/reports`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: async (req, file, callback) => {
    try {
      const uniqueSuffix = Date.now();
      const { originalname } = file;
      if (!originalname.includes('.pdf') || originalname.includes('$'))
        throw new Error();
      const nameFile = uniqueSuffix + '$' + originalname;
      callback(null, nameFile);
    } catch (error) {
      callback(
        new AppError(`Oops! , archivo sin extension pdf o contiene "$"`, 404),
        ''
      );
    }
  },
});

const storageContractsFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const { id } = req.params;
    if (!existsSync(_contractPath)) {
      mkdirSync(_contractPath, { recursive: true });
    }
    cb(null, `${_contractPath}/${id}`);
  },
  filename: async (req, file, callback) => {
    try {
      // const { fileName } = req.body;
      const { id } = req.params;
      const ext = file.originalname.split('.').at(-1);
      const name: string = id + '.' + ext;
      // const uniqueSuffix = Date.now();
      // const { originalname } = file;
      // if (!originalname.includes('.pdf') || originalname.includes('$'))
      //   throw new Error();
      // const fileName = uniqueSuffix + '$' + originalname;
      callback(null, name);
    } catch (error) {
      callback(
        new AppError(`Oops! , archivo sin extension pdf o contiene "$"`, 404),
        ''
      );
    }
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

export const uploadReportUser = multer({
  storage: storageReportUser,
});

export const uploadFileMail = multer({
  storage: storageFileMail,
});
export const uploadFileVoucher = multer({
  storage: storageFileVoucher,
});
export const uploadFileSpecialist = multer({
  storage: storageFileSpecialist,
});
export const uploadFileAreaSpecialty = multer({
  storage: storageAreaSpecialty,
});
export const uploadFileWorkStation = multer({
  storage: storageAddWorkStation,
});
export const uploadFileEquipment = multer({
  storage: storageAddEquipment,
});
export const uploadFileTrainingSpecialty = multer({
  storage: storageTrainingSpecialty,
});
export const uploadFileContracts = multer({
  storage: storageContractsFiles,
});
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    next(error);
  }
};
