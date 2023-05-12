import { Router } from 'express';
import { showTasks } from '../controllers';
// import
// showTask,
// deleteTasks,
//  showTasks,
// updateTask,
// createTask,
// '../controllers';

const router = Router();

router.get('/', showTasks);
// router.get('/:id', showTask);
// router.post('/', createTask);
// router.put('/:id', updateTask);
// router.delete('/:id', deleteTasks);
export default router;
