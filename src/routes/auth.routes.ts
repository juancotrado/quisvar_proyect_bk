import { Router } from 'express';
import { login, recoverPassword } from '../controllers';

const router = Router();

router.post('/', login);
router.patch('/recovery', recoverPassword);
export default router;
