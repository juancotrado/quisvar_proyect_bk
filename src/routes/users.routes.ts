import { Router } from 'express';
import {
  createUser,
  deleteUser,
  showTaskByUser,
  showUser,
  showUsers,
  updateUser,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _admin_role,
  _mod_role,
  _employee_role,
} from '../middlewares/role.middleware';

const router = Router();
router.post('/', createUser);
router.get('/', showUsers);
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id/tasks', showTaskByUser);
//MOD ROLE
router.use(_mod_role);
router.get('/:id', showUser);
//ADMIN ROLE
router.use(_admin_role);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
