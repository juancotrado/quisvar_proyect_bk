import { Router } from 'express';
import {
  createUser,
  deleteUser,
  showUser,
  showUsers,
  updateUser,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  adminRoleHandler,
  modRoleHandler,
  userRoleHandler,
} from '../middlewares/role.middleware';

const router = Router();

router.get('/', authenticateHandler, modRoleHandler, showUsers);
router.get('/:id', authenticateHandler, modRoleHandler, showUser);
router.post('/', createUser);
router.patch('/:id', authenticateHandler, adminRoleHandler, updateUser);
router.delete('/:id', authenticateHandler, adminRoleHandler, deleteUser);
export default router;
