import { Router } from 'express';
import {
  createTaskLvl_2,
  deleteTaskLvl_2,
  updateTaskLvl_2,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { showTaskLvl_2 } from '../controllers/task_2.controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.patch('/status/:id', updateTaskStatus);
router.get('/:id', showTaskLvl_2);
//MOD ROLE
// router.patch('/:id', taskVerify, assignedTask);
router.use(_mod_role);
router.post('/', createTaskLvl_2);
router.patch('/:id', updateTaskLvl_2);
router.delete('/:id', deleteTaskLvl_2);
export default router;
