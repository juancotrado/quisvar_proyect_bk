import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { createFeedback, findFeedbacks } from '../controllers';
import { editFeedback } from '../controllers/feedbacks.controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', findFeedbacks);
router.post('/', createFeedback);
//MODERATOR ROLE
router.use(_mod_role);
router.patch('/', editFeedback);
//ADMIN ROLE
router.use(_admin_role);

export default router;
