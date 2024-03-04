import { ControllerFunction } from 'types/patterns';
import { BasicLevelServices } from '../services';

class BasicLevelsController {
  public static create: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await BasicLevelServices.create(body);
      res.status(201).json(query);
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
