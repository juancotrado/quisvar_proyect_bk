import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createWorkStation,
  getWorkStation,
  updateWorkStation,
  deleteWorkStation,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getWorkStation);
router.post('/', createWorkStation);
router.patch('/:id', updateWorkStation);
router.delete('/:id', deleteWorkStation);
export default router;
