import { Router } from 'express';
import {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  updateWorkarea,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  modRoleHandler,
  userRoleHandler,
} from '../middlewares/role.middleware';

const router = Router();

router.get('/', authenticateHandler, userRoleHandler, showWorkareas);
router.get('/:id', authenticateHandler, userRoleHandler, showWorkArea);
router.post('/', authenticateHandler, userRoleHandler); //<==
router.put('/:id', authenticateHandler, modRoleHandler, updateWorkarea);
router.delete('/:id', authenticateHandler, modRoleHandler, deleteWorkarea);
export default router;
