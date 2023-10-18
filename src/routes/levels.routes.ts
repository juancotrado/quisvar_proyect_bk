import { Router } from 'express';
import {
  createLevel,
  updateLevel,
  deleteLevel,
  showLevel,
  updateTypeItem,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  // _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.patch('/status/:id', updateTaskStatus);
router.get('/:id', showLevel);
// router.get('/:id/subtasks', showSubtasksByIndexTask);
// router.patch('/:id', taskVerify, assignedTask);
//MOD ROLE
router.use(_mod_role);
router.put('/:id', updateLevel);
router.patch('/:id', updateTypeItem);
router.post('/', createLevel);
router.delete('/:id', deleteLevel);
export default router;
