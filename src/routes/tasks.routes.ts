import { Router } from 'express';
import {
  showTask,
  deleteTasks,
  showTasks,
  updateTask,
  createTask,
} from '../controllers';

const router = Router();

router.get('/', showTasks);
router.get('/:id', showTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTasks);
export default router;
