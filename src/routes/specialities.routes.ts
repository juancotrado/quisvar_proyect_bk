import { Router } from 'express';
import {
  createSpeciality,
  deleteSpeciality,
  showSpecialities,
  showSpeciality,
  updateSpeciality,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showSpecialities);
router.get('/:id', showSpeciality);
//MOD ROLE
router.use(_mod_role);
router.post('/', createSpeciality);
router.put('/:id', updateSpeciality);
router.delete('/:id', deleteSpeciality);
export default router;
