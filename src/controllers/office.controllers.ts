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
      const includeSelf = req.query.includeUser === 'true';
      const queries: ProfileByRoleType = {
        menuId: menuId ? +menuId : undefined,
        subMenuId: subMenuId ? +subMenuId : undefined,
        typeRol,
        subTypeRol,
        includeSelf,
      };
      const result = await OfficeServices.getAll(userId, queries);
      res.json(result).status(200);
    } catch (error) {
      next(error);
    }
  };
}
export default OfficeControllers;
