import { ControllerFunction } from 'types/patterns';
import { OfficeServices } from '../services';
import { ProfileByRoleType } from 'types/types';
import { UserType } from '../middlewares/auth.middleware';

class OfficeControllers {
  public static showAll: ControllerFunction = async (req, res, next) => {
    try {
      const { id: userId }: UserType = res.locals.userInfo;
      const { menuId, subMenuId, typeRol, subTypeRol } = req.query as Omit<
        ProfileByRoleType,
        'includeSelf'
      >;
      const includeSelf = req.query.includeSelf === 'true';
      const { includeUsers } = req.query;
      const includeUser = !includeUsers || includeUsers === 'true';
      const queries: ProfileByRoleType = {
        menuId: menuId && +menuId,
        subMenuId: subMenuId && +subMenuId,
        typeRol,
        subTypeRol,
        includeSelf,
      };
      const result = await OfficeServices.getAll(userId, includeUser, queries);
      res.json(result).status(200);
    } catch (error) {
      next(error);
    }
  };

  public static create: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await OfficeServices.create(body);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static update: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id: officeId } = req.params;
      const query = await OfficeServices.update(+officeId, body);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public static remove: ControllerFunction = async (req, res, next) => {
    try {
      const { id: officeId } = req.params;
      const query = await OfficeServices.delete(+officeId);
      res.status(204).json(query);
    } catch (error) {
      next(error);
    }
  };
}
export default OfficeControllers;
