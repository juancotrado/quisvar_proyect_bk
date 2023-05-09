import { Router } from 'express';
import { createUser, deleteUser, showUsers, updateUser } from '../controllers';

const router = Router();

router.get('/', showUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
