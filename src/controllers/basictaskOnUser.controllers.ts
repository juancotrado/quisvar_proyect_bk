import { ControllerFunction } from 'types/patterns';
import { BasicTaskOnUserServices } from '../services';

class BasicTaskOnUserControllers {
  public static addUser: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const result = await BasicTaskOnUserServices.add(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static addMod: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const result = await BasicTaskOnUserServices.addMod(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static addColabs: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const result = await BasicTaskOnUserServices.addColaborators(+id, body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static changeStatus: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const result = await BasicTaskOnUserServices.authorizateUsers(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static removeUser: ControllerFunction = async (req, res, next) => {
    try {
      const { id: userIdList } = req.params;
      const result = await BasicTaskOnUserServices.remove(+userIdList);
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static removeMod: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { body } = req;
      const result = await BasicTaskOnUserServices.removeMod({
        taskId: +id,
        ...body,
      });
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default BasicTaskOnUserControllers;
