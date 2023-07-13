import { NextFunction, Request, Response } from 'express';
import { SubTasksServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';

export const showSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.find(_subtask_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const createSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await SubTasksServices.create(body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.update(_subtask_id, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const assignedSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userInfo: UserType = res.locals.userInfo;
    const userId = userInfo.id;
    const _task_id = parseInt(id);
    const status = req.query.status as 'decline' | 'apply' | 'review';
    const query = await SubTasksServices.assigned(_task_id, userId, status);
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateStatusSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const userInfo: UserType = res.locals.userInfo;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.updateStatus(
      _subtask_id,
      body,
      userInfo
    );
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteSubTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.delete(_subtask_id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const uploadFileSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!req.file) return;
    const { filename } = req.file;
    const query = await SubTasksServices.upload(filename, +id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const assignUserBySubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    console.log(body, id);
    // if (!req.file) return;
    // const { filename } = req.file;

    const query = await SubTasksServices.assignUserBySubtask(body, +id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};

export const updateStatusPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const pdf = req.query.pdf == 'true';
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.updateHasPDF(_subtask_id, pdf);
    return query;
  } catch (error) {
    next(error);
  }
};

export const updatePercentage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const _subtask_id = parseInt(id);
    const query = await SubTasksServices.updatePercentage(_subtask_id, body);
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

export const deleteFileSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { filename } = req.params;
    const query = await SubTasksServices.deleteFile(filename, +id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
