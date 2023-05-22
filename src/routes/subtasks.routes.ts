import { Router } from 'express';
import {
  showSubTask,
  //   createSubTask,
  //   updateSubTask,
  //   deleteSubTasks,
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
router.get('/:id', showSubTask);
//MOD ROLE
router.use(_mod_role);
// router.post('/', createSubTask);
// router.put('/:id', updateSubTask);
// router.delete('/:id', deleteSubTasks);

export default router;
