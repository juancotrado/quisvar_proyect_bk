import { Router } from 'express';
import {
  showProject,
  showProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';
import {
  archiverProject,
  deleteArchiverProject,
} from '../controllers/projects.controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showProjects);
router.get('/:id', showProject);
//MOD ROLE
router.use(_mod_role);
router.post('/', createProject);
router.post('/archiver', archiverProject);
router.delete('/archiver', deleteArchiverProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
export default router;
