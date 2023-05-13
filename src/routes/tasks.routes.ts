import { Router } from 'express';
import {
  createTask,
  deleteTasks,
  showTask,
  updateTaskStatus,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { adminRoleHandler, modRoleHandler, userRoleHandler } from '../middlewares/role.middleware';

const router = Router();

router.get('/:id', authenticateHandler, userRoleHandler,showTask);
router.patch('/status/:id',authenticateHandler,modRoleHandler,  updateTaskStatus);
router.post('/', authenticateHandler,modRoleHandler,  createTask);
// router.put('/:id', authenticateHandler, adminRoleHandler, updateTask);
router.delete('/:id', authenticateHandler, modRoleHandler,deleteTasks);
export default router;
