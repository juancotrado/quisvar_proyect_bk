import { NextFunction, Request, Response } from 'express';
import { ContractServices } from '../services';

class ContractController {
  public static async showContracts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ContractServices.showAll();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async showContract(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const result = await ContractServices.show(+id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async createContract(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { body } = req;
      const result = await ContractServices.create(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async updateContract(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { body } = req;
      const { id } = req.params;
      const result = await ContractServices.update(+id, body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteContract(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const result = await ContractServices.delete(+id);
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async uploadFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // const { id } = req.params;
      const a = req.file;
      // const result = await ContractServices.delete(+id);
      res.status(204).json(a);
    } catch (error) {
      next(error);
    }
  }
}
export default ContractController;
