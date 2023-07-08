import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { duplicateProject } from '../controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
//MODERATOR ROLE
router.use(_mod_role);
router.get('/project/:id', duplicateProject);
//ADMIN ROLE
router.use(_admin_role);

export default router;
