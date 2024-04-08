import { ControllerFunction } from 'types/patterns';
import ProfessionService from '../services/profession.services';

export class ProfessionController {
  public showProfessions: ControllerFunction = async (_req, res, next) => {
    try {
      const result = ProfessionService.showProfessions();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
