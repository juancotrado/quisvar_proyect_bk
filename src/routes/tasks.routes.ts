import { Router } from 'express';
import {
  createTask,
  deleteTasks,
  showTask,
  updateTaskStatus,
  updateTask,
  assignedTask,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', showTask);
router.patch('/:id', assignedTask);
router.put('/:id', updateTask);
//MOD ROLE
router.use(_mod_role);
router.post('/', createTask);
router.patch('/status/:id', updateTaskStatus);
router.delete('/:id', deleteTasks);
export default router;
