import { ProfessionController } from '../controllers/profession.controller';
import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
// import { _mod_role, _employee_role } from '../middlewares/role.middleware';

const professionController = new ProfessionController();
const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.get('/', professionController.showProfessions);

export default router;
