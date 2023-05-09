import { Router } from 'express';
import { showTask,deleteTasks } from '../controllers';

const router = Router();

router.get('/', showTask);
router.delete('/:id', deleteTasks);
export default router;
