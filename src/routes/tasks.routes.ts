import { Router } from 'express';
import {
  createTask,
  deleteTasks,
  showTask,
  updateTaskStatus,
} from '../controllers';

const router = Router();

router.get('/:id', showTask);
router.patch('/status/:id', updateTaskStatus);
router.post('/', createTask);
// router.put('/:id', updateTask);
router.delete('/:id', deleteTasks);
export default router;
