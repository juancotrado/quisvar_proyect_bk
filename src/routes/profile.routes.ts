import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
import { _employee_role, _admin_role } from '../middlewares/role.middleware';
import { downloadProfile, showProfile, updateProfile } from '../controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showProfile);
router.get('/download', downloadProfile);
//ADMIN ROLE
router.use(_admin_role);
router.put('/:id', updateProfile);

export default router;
