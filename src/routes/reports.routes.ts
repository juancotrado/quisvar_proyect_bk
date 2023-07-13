import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
import { _employee_role, _admin_role } from '../middlewares/role.middleware';
import { generateIndex, showListReportByUser } from '../controllers';

const router = Router();
router.get('/');
router.get('/index/:id', generateIndex);
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/user', showListReportByUser);
//ADMIN ROLE
router.use(_admin_role);

export default router;
