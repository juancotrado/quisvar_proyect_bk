import { ControllerFunction } from 'types/patterns';
import { BasicTasksServices } from '../services';

class BasicTaskControllers {
  public static find: ControllerFunction = async (req, res, next) => {
    try {
      //
      const { id: subtask_id } = req.params;
      const query = await BasicTasksServices.find(+subtask_id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static create: ControllerFunction = async (req, res, next) => {
    try {
      const { stageId: stagesId, ...body } = req.body;
      const pat = await BasicTasksServices.create(body);
      // const query = await BasicTasksServices.find(+stagesId);
      // res.status(201).json({ ...query, stagesId });
      res.status(201).json({ ...pat, stagesId });
    } catch (error) {
      next(error);
    }
  };

  public static upperOrLower: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id: subtask_id } = req.params;
      const type = req.query.type as 'upper' | 'lower';
      const query = await BasicTasksServices.addToUpperorLower(
        +subtask_id,
        body,
        type
      );
      res.status(201).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public static update: ControllerFunction = async (req, res, next) => {
    try {
      const { id: taskId } = req.params;
      const { body } = req;
      const query = await BasicTasksServices.update(+taskId, body);
      res.status(200).json(query);
      //
    } catch (error) {
      next(error);
    }
  };

  public static delete: ControllerFunction = async (req, res, next) => {
    try {
      const { id: taskId } = req.params;
      const query = await BasicTasksServices.delete(+taskId);
      res.status(200).json(query);
      //
    } catch (error) {
      next(error);
    }
  };

  // public static create: ControllerFunction = async (req, res, next) => {
  //   try {
  //     //
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default BasicTaskControllers;
