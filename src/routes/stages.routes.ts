import { Router } from 'express';
import {
  createStage,
  deleteStage,
  showListStages,
  updateStage,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showListStages);
//MOD ROLE
router.use(_mod_role);
router.post('/', createStage);
router.patch('/:id', updateStage);
router.delete('/:id', deleteStage);
export default router;
