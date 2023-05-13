import { Router } from 'express';
import { login } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

const router = Router();

router.post('/',login);
export default router;
