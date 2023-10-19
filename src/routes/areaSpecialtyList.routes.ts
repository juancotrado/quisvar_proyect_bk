import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createAreaSpecialtyList,
  deleteAreaSpecialtyList,
  getAreaSpecialtyList,
  updateAreaSpecialtyList,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getAreaSpecialtyList);
router.post('/', createAreaSpecialtyList);
router.patch('/:id', updateAreaSpecialtyList);
router.delete('/:id', deleteAreaSpecialtyList);
export default router;
