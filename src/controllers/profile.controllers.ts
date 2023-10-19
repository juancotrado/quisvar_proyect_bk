import { NextFunction, Request, Response } from 'express';
import { ProfileServices, UsersServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';

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
    // const dirSplit = __dirname.split('\\');
    // console.log(__dirname);
    // const dirPath = dirSplit.slice(0, dirSplit.length - 2).join('/');
    // const folder = '/files';
    // // const newDirPath = dirPath + folder + '/Vector.rar';
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
    console.log('patito');
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
    const { email, ...profile } = req.body;
    const { id } = req.params;
    const query = await ProfileServices.update(+id, profile, email);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};
