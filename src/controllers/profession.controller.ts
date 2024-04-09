import { ControllerFunction } from 'types/patterns';
import ProfessionService from '../services/profession.services';

export class ProfessionController {
  getAll: ControllerFunction = async (_req, res, next) => {
    try {
      const result = ProfessionService.professions;
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const result = ProfessionService.create(body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = ProfessionService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  update: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { abrv, label } = req.body;
      const result = ProfessionService.update({ abrv, label, value: id });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
