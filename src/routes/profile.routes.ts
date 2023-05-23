import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
import { _employee_role } from '../middlewares/role.middleware';
import { showProfile } from '../controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showProfile);

export default router;
