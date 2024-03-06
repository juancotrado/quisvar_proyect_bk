import { ControllerFunction } from 'types/patterns';
import { BasicLevelServices } from '../services';

class BasicLevelsController {
  public static create: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await BasicLevelServices.create(body);
      res.status(201).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public static findByStage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: stageId } = req.params;
      const query = await BasicLevelServices.find(+stageId);
      res.status(200).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public static upperOrLower: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id: subtask_id } = req.params;
      const type = req.query.type as 'upper' | 'lower';
      const query = await BasicLevelServices.addToUpperorLower(
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
      const { body } = req;
      const { id: task_id } = req.params;
      const query = await BasicLevelServices.update(+task_id, body);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static delete: ControllerFunction = async (req, res, next) => {
    try {
      const { id: levelId } = req.params;
      const query = await BasicLevelServices.delete(+levelId);
      res.status(200).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  // public static delete: ControllerFunction = async (req, res, next) => {
  //   try {
  //   } catch (error) {
  //     next(error);
  //   }
}
export default BasicLevelsController;
