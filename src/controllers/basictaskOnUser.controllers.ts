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

  public static removeUser: ControllerFunction = async (req, res, next) => {
    try {
      const { id: userIdList } = req.params;
      const result = await BasicTaskOnUserServices.remove(+userIdList);
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default BasicTaskOnUserControllers;
