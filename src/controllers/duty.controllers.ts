import { ControllerFunction } from 'types/patterns';
import { DutyServices } from '../services';

// GROUPS
class DutyControllers {
  public createDuty: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await DutyServices.create(body);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  public updateDuty: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { body } = req;
      const query = await DutyServices.update(+id, body);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}
export default new DutyControllers();
