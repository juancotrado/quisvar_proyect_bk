import { ControllerFunction } from 'types/patterns';
import RoleService from '../services/role.service';
import { RoleForMenuPick } from '../utils/format.server';

export class RoleController {
  public shows: ControllerFunction = async (req, res, next) => {
    try {
      const result = await RoleService.getAll();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  public create: ControllerFunction = async (req, res, next) => {
    try {
      const body: RoleForMenuPick = req.body;
      console.log(body);
      const query = await RoleService.create(body);
      res.status(201).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public update: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const body: RoleForMenuPick = req.body;
      const query = await RoleService.edit(body, +id);
      res.status(201).json(query);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public showMenu: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await RoleService.findGeneral(+id);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
  public show: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = await RoleService.find(+id);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };
}
