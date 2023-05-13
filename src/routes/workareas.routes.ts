import { Router } from 'express';
import { showWorkareas, deleteWorkarea, showWorkArea } from '../controllers';

const router = Router();

router.get('/', showWorkareas);
router.delete('/:id', deleteWorkarea);
router.get('/:id', showWorkArea);
export default router;
