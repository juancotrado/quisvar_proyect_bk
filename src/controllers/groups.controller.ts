import { NextFunction, Request, Response } from 'express';
import { GroupServices } from '../services';

// GROUPS
export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const query = await GroupServices.create(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const editOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const query = await GroupServices.editOrder(body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
// export const deleteMod = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;
//     const query = await GroupServices.deleteMod(+id);
//     res.status(200).json(query);
//   } catch (error) {
//     next(error);
//   }
// };
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await GroupServices.getAll();
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await GroupServices.getById(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const getUserTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, contractId } = req.params;
    const query = await GroupServices.getUserTask(+id, +contractId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const query = await GroupServices.update(+id, name);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const query = await GroupServices.delete(+id);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
//GROUP RELATION
export const createRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, groupId } = req.params;
    const query = await GroupServices.createRelation(+userId, +groupId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const updateRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, groupId } = req.params;
    const body = req.body;
    const query = await GroupServices.updateRelation(+userId, +groupId, body);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const deleteRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, groupId } = req.params;
    const query = await GroupServices.deleteRelation(+userId, +groupId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
export const findProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { groupId } = req.params;
    const query = await GroupServices.findProjects(+groupId);
    res.status(200).json(query);
  } catch (error) {
    next(error);
  }
};
