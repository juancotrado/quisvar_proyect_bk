import { Response, Request, NextFunction } from 'express';
import { PathLevelServices, StageServices } from '../services';
import { mkdirSync, rmSync } from 'fs';
import { renameDir, setNewPath } from '../utils/fileSystem';

export const showListStages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await StageServices.findMany();
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const showStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _stage_id = parseInt(id);
    const query = await StageServices.find(_stage_id);
    return res.status(200).json(query[0]);
  } catch (error) {
    next(error);
  }
};

export const createStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await StageServices.create(body);
    const modelPath = await PathLevelServices.pathStage(query.id, 'MODEL');
    const reviewPath = await PathLevelServices.pathStage(query.id, 'REVIEW');
    const uploadPath = await PathLevelServices.pathStage(query.id, 'UPLOADS');
    if (query) {
      mkdirSync(modelPath);
      mkdirSync(reviewPath);
      mkdirSync(uploadPath);
    }
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const _stage_id = parseInt(id);
    const oldModelPath = await PathLevelServices.pathStage(_stage_id, 'MODEL');
    const oldReviewPath = await PathLevelServices.pathStage(
      _stage_id,
      'REVIEW'
    );
    const oldUpLoadPath = await PathLevelServices.pathStage(
      _stage_id,
      'UPLOADS'
    );

    const query = await StageServices.update(_stage_id, body);
    const newModelPath = setNewPath(oldModelPath, query.name);
    const newReviewPath = setNewPath(oldReviewPath, query.name);
    const newUpLoadPath = setNewPath(oldUpLoadPath, query.name);
    if (query) {
      renameDir(oldModelPath, newModelPath);
      renameDir(oldReviewPath, newReviewPath);
      renameDir(oldUpLoadPath, newUpLoadPath);
    }
    return res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const _stage_id = parseInt(id);
    const modelPath = await PathLevelServices.pathStage(_stage_id, 'MODEL');
    const reviewPath = await PathLevelServices.pathStage(_stage_id, 'REVIEW');
    const uploadPath = await PathLevelServices.pathStage(_stage_id, 'UPLOADS');
    const query = await StageServices.delete(_stage_id);
    if (query) {
      rmSync(modelPath, { recursive: true });
      rmSync(reviewPath, { recursive: true });
      rmSync(uploadPath, { recursive: true });
    }
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
