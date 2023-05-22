import { Router } from 'express';
import { showIndexTask } from '../controllers';
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
// router.patch('/:id', taskVerify, assignedTask);
// router.put('/:id', updateTask);
//MOD ROLE
router.use(_mod_role);
// router.post('/', createTask);
// router.delete('/:id', deleteTasks);
export default router;
