import { ControllerFunction } from 'types/patterns';
import { FeedbackBasicServices, PathServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import { BasicFiles } from '@prisma/client';
import { BasicFilesParsing } from 'types/types';

class FeedbackBasicControllers {
  public static getByTask: ControllerFunction = async (req, res, next) => {
    try {
      const { id: taskId } = req.params;
      const result = await FeedbackBasicServices.showByTask(+taskId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static create: ControllerFunction = async (req, res, next) => {
    try {
      const { id: subTasksId } = req.params;
      const percentage = req.body.percentage;
      const user: UserType = res.locals.userInfo;
      if (!req.files) return;
      const newFiles = req.files as Express.Multer.File[];
      const dir = await PathServices.basicTask(+subTasksId, 'REVIEW');
      const files = newFiles.map(({ filename: name, originalname }) => {
        const type: BasicFiles['type'] = 'REVIEW';
        const originalName = originalname;
        const data = { name, dir, originalName, type };
        const values: BasicFilesParsing = {
          ...data,
          subTasksId: +subTasksId,
        };
        return values;
      });
      const data = { subTasksId: +subTasksId, percentage: +percentage, files };
      const result = await FeedbackBasicServices.create(data, user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static review: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user: UserType = res.locals.userInfo;
      const data = { id: +id, ...body };
      const result = await FeedbackBasicServices.review(data, user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default FeedbackBasicControllers;
