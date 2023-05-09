import { Router } from 'express';
import { showTask, deleteTasks, showTasks, updateTask } from '../controllers';

const router = Router();

router.get('/', showTasks);
router.get('/:id', showTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTasks);
export default router;
