import { Router } from 'express';
import {
  showWorkareas,
  deleteWorkarea,
  showWorkArea,
  updateWorkarea,
} from '../controllers';

const router = Router();

router.get('/', showWorkareas);
router.get('/:id', showWorkArea);
router.put('/:id', updateWorkarea);
router.delete('/:id', deleteWorkarea);
export default router;
