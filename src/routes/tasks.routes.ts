import { Router } from 'express';
import { showTask, deleteTasks, showTasks } from '../controllers';

const router = Router();

router.get('/', showTasks);
router.get('/:id', showTask);
router.delete('/:id', deleteTasks);
export default router;
