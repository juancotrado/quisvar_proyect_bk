import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createTrainingSpecialtyList,
  getTrainingSpecialtyList,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getTrainingSpecialtyList);
router.post('/', createTrainingSpecialtyList);
export default router;
