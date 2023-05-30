import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

const MAX_SIZE = 1024 * 1000 * 1000;
const FILE_TYPES = ['.rar', '.zip'];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now();
    const { id } = req.params;
    callback(null, id + '-' + uniqueSuffix + '$' + file.originalname);
  },
});

const checkFileType = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const extName = path.extname(file.originalname);
  if (FILE_TYPES.includes(extName)) return callback(null, true);
  return callback(new Error('upload the file with the requested extension!'));
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
  // fileFilter: checkFileType,
});

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Succefully upload file' });
  } catch (error) {
    next(error);
  }
};
