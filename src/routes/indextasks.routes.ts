import { Router } from 'express';
import {
  createIndexTask,
  deleteIndexTasks,
  showIndexTask,
  showSubtasksByIndexTask,
  updatIndexTask,
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
// router.patch('/status/:id', updateTaskStatus);
router.get('/:id', showIndexTask);
router.get('/:id/subtasks', showSubtasksByIndexTask);
// router.patch('/:id', taskVerify, assignedTask);
//MOD ROLE
router.patch('/:id', updatIndexTask);
router.use(_mod_role);
router.post('/', createIndexTask);
router.delete('/:id', deleteIndexTasks);
export default router;
