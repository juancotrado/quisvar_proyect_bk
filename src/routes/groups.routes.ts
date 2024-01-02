import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createGroup,
  getAll,
  getById,
  updateGroup,
  deleteGroup,
  createRelation,
  updateRelation,
  deleteRelation,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
//Employ role
router.get('/all', getAll);
//Admin role
router.use(_admin_role);
router.post('/', createGroup);
router.get('/:id', getById);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/relation/:userId/:groupId', createRelation);
router.patch('/relation/:userId/:groupId', updateRelation);
router.delete('/relation/:userId/:groupId', deleteRelation);
export default router;
