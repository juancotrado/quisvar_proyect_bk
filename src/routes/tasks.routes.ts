import { Router } from 'express';
import { showTask, showTasks } from '../controllers';

const router = Router();

router.get('/', showTasks);
router.get('/:id', showTask);
export default router;
