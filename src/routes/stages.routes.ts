import { Router } from 'express';
import { addNewStage, StagesControllers } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';
import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const router = Router();
router.get('/details/:id', StagesControllers.details);
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', StagesControllers.showList);
router.get('/:id', StagesControllers.show);
//MOD ROLE
router.use(_mod_role);
router.post('/', StagesControllers.create);
router.post('/new/:id', addNewStage);
router.patch('/:id', StagesControllers.update);
router.patch('/details/:id', StagesControllers.updateDetails);
router.delete('/:id', StagesControllers.delete);
export default router;
