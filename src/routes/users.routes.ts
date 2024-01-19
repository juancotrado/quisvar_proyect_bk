import { Router } from 'express';
import {
  createUser,
  deleteUser,
  showTaskByUser,
  showUser,
  showUsers,
  updateUser,
  showSubTasksByUser,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _admin_role,
  _mod_role,
  _employee_role,
} from '../middlewares/role.middleware';
import { uploads } from '../middlewares';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showUsers);
router.get('/:id/tasks', showTaskByUser);
router.get('/:id/subTasks', showSubTasksByUser);
//MOD ROLE
router.use(_mod_role);
router.get('/:id', showUser);
//ADMIN ROLE
router.use(_admin_role);
router.post(
  '/',
  // acceptFormData,
  // verifyUniqueParam,
  uploads.fileUser.fields([
    { name: 'fileUserCv' },
    { name: 'fileUserDeclaration' },
  ]),
  createUser
);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
