import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createConsortium,
  deleteById,
  getAllConsortium,
  getBoth,
  getConsortiumById,
  updateById,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
//Admin role
router.use(_admin_role);
router.post('/', createConsortium);
router.get('/all', getAllConsortium);
router.get('/both', getBoth);
router.get('/:id', getConsortiumById);
router.patch('/:id', updateById);
router.delete('/:id', deleteById);
export default router;
