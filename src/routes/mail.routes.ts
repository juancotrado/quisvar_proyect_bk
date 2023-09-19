import { Router } from 'express';
import { showMessages, createMessage, showMessage } from '../controllers';
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
// router.get('/:id', showMessages);
router.get('/:id', showMessage);
router.post('/', createMessage);
// router.patch('/status/:id', updateTaskStatus);
// router.get('/:id/subtasks', showSubtasksByIndexTask);
// router.patch('/:id', taskVerify, assignedTask);
//MOD ROLE
router.use(_mod_role);
export default router;
