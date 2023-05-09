import { Router } from 'express';
import { showTask, showTasks, deleteTask } from '../controllers';

const router = Router();

router.get('/', showTasks);
router.get('/:id', showTask);
router.delete('/:id', deleteTask);
export default router;
