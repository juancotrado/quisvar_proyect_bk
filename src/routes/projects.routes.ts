import { Router } from 'express';
import { showProject, deleteProject, showProjects } from '../controllers';

const router = Router();

router.get('/', showProjects);
router.delete('/:id', deleteProject);
router.get('/:id', showProject);
export default router;
