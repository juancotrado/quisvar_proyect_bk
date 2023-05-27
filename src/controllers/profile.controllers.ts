import { NextFunction, Request, Response } from 'express';
import { ProfileServices, UsersServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import path from 'path';
import { slice } from 'pdfkit/js/data';

export const showProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo: UserType = res.locals.userInfo;
    const { id } = userInfo;
    const query = await UsersServices.find(id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const downloadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dirSplit = __dirname.split('\\');
    console.log(__dirname);
    const dirPath = dirSplit.slice(0, dirSplit.length - 2).join('/');
    const folder = '/files';
    const newDirPath = dirPath + folder + '/Vector.rar';
    res.download('./files/Vector.rar', err => {
      console.log(err);
      res.status(404).json(err);
    });
    // res.json({ message: newDirPath });
  } catch (error) {
    next(error);
  }
};

export const uploadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _id = parseInt(id);
    const query = await ProfileServices.update(_id, body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
