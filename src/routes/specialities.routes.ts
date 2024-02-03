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
import { role } from '../middlewares';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(role.RoleHandler('especialidades', 'MEMBER'));
router.get('/', showSpecialities);
router.get('/:id', showSpeciality);
//MOD ROLE
router.use(role.RoleHandler('especialidades', 'MOD'));
router.post('/', createSpeciality);
router.put('/:id', updateSpeciality);
router.delete('/:id', deleteSpeciality);
export default router;
