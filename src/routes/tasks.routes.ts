import { Router } from 'express';
import { showTask } from '../controllers';

const router = Router();

router.get('/', showTask);
export default router;
