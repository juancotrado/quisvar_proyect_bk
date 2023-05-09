import { Router } from 'express';
import { showWorkareas, deleteWorkarea } from '../controllers';

const router = Router();

router.get('/', showWorkareas);
router.delete('/:id', deleteWorkarea);
export default router;
