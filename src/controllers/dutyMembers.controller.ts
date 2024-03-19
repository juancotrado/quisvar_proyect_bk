import { ControllerFunction } from 'types/patterns';
import { DutyMembersServices } from '../services';

// Duty Members
class DutyMembersControllers {
  public createDutyMember: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await DutyMembersServices.create(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
  public deleteDutyMember: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await DutyMembersServices.delete(+id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}
export default new DutyMembersControllers();
