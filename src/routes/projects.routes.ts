import { Router } from 'express';
import { showProject, deleteProject, showProjects } from '../controllers';
import { createProject } from '../controllers/projects.controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { modRoleHandler, userRoleHandler } from '../middlewares/role.middleware';

const router = Router();

router.get('/',authenticateHandler, userRoleHandler, showProjects);
router.delete('/:id', authenticateHandler, modRoleHandler, deleteProject);
router.get('/:id', authenticateHandler, userRoleHandler, showProject);
router.post('/', authenticateHandler ,modRoleHandler, createProject);
export default router;
