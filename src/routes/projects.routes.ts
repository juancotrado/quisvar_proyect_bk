import { Router } from 'express';
import { showProject, deleteProject, showProjects } from '../controllers';
import { createProject } from '../controllers/projects.controllers';

const router = Router();

router.get('/', showProjects);
router.delete('/:id', deleteProject);
router.get('/:id', showProject);
router.post('/',createProject);
export default router;
