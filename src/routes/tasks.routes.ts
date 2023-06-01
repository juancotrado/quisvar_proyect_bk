import { Router } from 'express';
import { createTask, deleteTasks, updateTask, showTask } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import taskVerify from '../middlewares/user.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.patch('/status/:id', updateTaskStatus);
router.get('/:id', showTask);
//MOD ROLE
// router.patch('/:id', taskVerify, assignedTask);
router.use(_mod_role);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTasks);
export default router;
