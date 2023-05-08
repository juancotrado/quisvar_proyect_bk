import { Router } from 'express';
import { createUser, showUsers } from '../controllers';

const router = Router();

router.get('/', showUsers);
router.post('/', createUser);
export default router;
