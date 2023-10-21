import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getEquipment);
router.post('/', createEquipment);
router.patch('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);
export default router;
