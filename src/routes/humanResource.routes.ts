import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _admin_role,
  _mod_role,
  _employee_role,
} from '../middlewares/role.middleware';
import { uploadReportUser } from '../middlewares/upload.middleware';
import { createReportByUser, showReportsBySupervisor } from '../controllers';

const router = Router();

router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', showReportsBySupervisor);
router.post('/', uploadReportUser.single('reportuser'), createReportByUser);

//MOD ROLE
router.use(_mod_role);
//ADMIN ROLE
router.use(_admin_role);

export default router;
