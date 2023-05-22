import { Router } from 'express';
import {
  showProject,
  // deleteProject,
  // showProjects
} from '../controllers';
// import {
//   createProject,
//   updateProject,
// } from '../controllers/projects.controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
// router.get('/', showProjects);
router.get('/:id', showProject);
//MOD ROLE
router.use(_mod_role);
// router.post('/', createProject);
// router.put('/:id', updateProject);
// router.delete('/:id', deleteProject);
export default router;
