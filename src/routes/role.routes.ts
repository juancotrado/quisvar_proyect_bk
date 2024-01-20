import { RoleController } from './../controllers/role.controller';
import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
// import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const roleController = new RoleController();
const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.get('/', roleController.shows);
router.get('/menu/:id', roleController.showMenu);
router.get('/:id', roleController.show);
router.put('/:id', roleController.update);
// router.get('/:id', showSpeciality);
//MOD ROLE
// router.use(_mod_role);
router.post('/', roleController.create);
// router.put('/:id', updateSector);
// router.delete('/:id', deleteSector);
export default router;
