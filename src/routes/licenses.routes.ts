import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createLicense,
  createFreeForAll,
  updateLicense,
  approveLicense,
  getLicenseById,
  getLicensesByStatus,
  getLicensesEmployee,
  expiredLicenses,
  deleteLicense,
  activeLicenses,
  getLicensesFee,
  updateCheckOut,
} from '../controllers';
import { _admin_role, _employee_role } from '../middlewares/role.middleware';
// import { role } from '../middlewares';
const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.use(role.RoleHandler('licencias', 'USER'));
router.get('/employee/:id', getLicensesEmployee);
router.get('/fee/:id', getLicensesFee);
router.post('/', createLicense);
router.post('/free', createFreeForAll);
router.patch('/:id', updateLicense);
router.patch('/approve/:id', approveLicense);
router.patch('/checkout/:id', updateCheckOut);
router.get('/active', activeLicenses);
router.delete('/:id', deleteLicense);
//ADMIN ROLE
router.use(_admin_role);
// router.use(role.RoleHandler('licencias', 'MOD'));
router.get('/', getLicenseById);
router.get('/status', getLicensesByStatus);
router.post('/expired', expiredLicenses);
export default router;
