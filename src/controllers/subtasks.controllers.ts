import { NextFunction, Request, Response } from 'express';
import { StageServices, SubTasksServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import { ControllerFunction } from 'types/patterns';

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
    const { stageId, ...body } = req.body;
    await SubTasksServices.create(body);
    const query = await StageServices.find(+stageId);
    res.status(201).json({ ...query, stagesId: stageId });
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
    const { stageId, ...body } = req.body;
    const { id } = req.params;
    const _subtask_id = parseInt(id);
    await SubTasksServices.update(_subtask_id, body);
    const query = await StageServices.find(+stageId);
    res.status(201).json({ ...query, stagesId: stageId });
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
    const { id, stageId } = req.params;
    const { body } = req;
    const userInfo: UserType = res.locals.userInfo;
    const _subtask_id = parseInt(id);
    const task = await SubTasksServices.updateStatus(
      _subtask_id,
      body,
      userInfo
    );
    const project = await StageServices.find(+stageId);
    res.status(200).json({
      task,
      project: {
        ...project,
        stagesId: stageId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetStatusSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, stageId } = req.params;
    const _subtask_id = parseInt(id);
    const task = await SubTasksServices.resetStatus(_subtask_id);
    const project = await StageServices.find(+stageId);
    res.status(200).json({
      task,
      project: {
        ...project,
        stagesId: stageId,
      },
    });
  } catch (error) {
    next(error);
  }
};

class SubtaskControllers {
  public static addToUp: ControllerFunction = async (req, res, next) => {
    try {
      const { id: subtask_id, stageId } = req.params;
      const type = req.query.type as 'upper' | 'lower';
      const { body } = req;
      await SubTasksServices.addToUper(+subtask_id, { ...body }, type);
      const query = await StageServices.find(+stageId);
      res.status(201).json({ ...query, stagesId: stageId });
    } catch (error) {
      next(error);
    }
  };
}

export default SubtaskControllers;
export const deleteSubTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, stageId } = req.params;
    const _subtask_id = parseInt(id);
    await SubTasksServices.delete(_subtask_id);
    const query = await StageServices.find(+stageId);
    res.status(201).json({ ...query, stagesId: stageId });
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
    const { id, stageId } = req.params;
    const { body } = req;
    const task = await SubTasksServices.assignUserBySubtask(body, +id);
    const project = await StageServices.find(+stageId);
    res.status(200).json({
      task,
      project: {
        ...project,
        stagesId: stageId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// export const updateStatusPDF = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;
//     const pdf = req.query.pdf == 'true';
//     const _subtask_id = parseInt(id);
//     const query = await SubTasksServices.updateHasPDF(_subtask_id, pdf);
//     return query;
//   } catch (error) {
//     next(error);
//   }
// };

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
