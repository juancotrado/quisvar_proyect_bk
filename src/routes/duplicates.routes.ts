import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import {
  duplicateArea,
  duplicateIndexTask,
  duplicateProject,
  duplicateTask,
  duplicateTask2,
  duplicateTask3,
} from '../controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
//MODERATOR ROLE
router.use(_mod_role);
router.post('/project/:id', duplicateProject);
router.post('/area/:id', duplicateArea);
router.post('/indextask/:id', duplicateIndexTask);
router.post('/task/:id', duplicateTask);
router.post('/task2/:id', duplicateTask2);
router.post('/task3/:id', duplicateTask3);
//ADMIN ROLE
router.use(_admin_role);

export default router;
