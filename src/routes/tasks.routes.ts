import { Router } from 'express';
import { showTask,deleteUser } from '../controllers';

const router = Router();

router.get('/', showTask);
router.delete('/:id', deleteUser);
export default router;
