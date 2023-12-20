import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createLicense,
  createFreeForAll,
  updateLicense,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  expiredLicenses,
} from '../controllers';
import { _admin_role, _employee_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/employee/:id', getLicensesEmployee);
router.post('/', createLicense);
router.post('/free', createFreeForAll);
router.patch('/:id', updateLicense);
//ADMIN ROLE
router.use(_admin_role);
router.get('/', getLicenseById);
router.get('/status', getLicensesByStatus);
router.post('/expired', expiredLicenses);
export default router;
