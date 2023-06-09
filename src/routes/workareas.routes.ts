import { Router } from 'express';
import {
  showWorkArea,
  // showWorkareas,
  deleteWorkarea,
  updateWorkarea,
  createWorkArea,
  showReviewList,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.get('/', showWorkareas);
router.get('/:id', showWorkArea);
//MOD ROLE
router.use(_mod_role);
router.get('/:id/review', showReviewList);
router.post('/', createWorkArea);
router.put('/:id', updateWorkarea);
router.delete('/:id', deleteWorkarea);
export default router;
