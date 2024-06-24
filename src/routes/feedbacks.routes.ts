import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import {
  createFeedback,
  FeedbackBasicControllers,
  findFeedbacks,
} from '../controllers';
import { editFeedback } from '../controllers/feedbacks.controllers';
import { uploads } from '../middlewares';
const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', findFeedbacks);
router.post('/', createFeedback);
router.get('/basic-task/:id', FeedbackBasicControllers.getByTask);
router.post(
  '/basic-task/:id',
  uploads.basicFiles('EDITABLES').array('files'),
  FeedbackBasicControllers.create
);
router.patch('/basic-task/:id', FeedbackBasicControllers.review);
//MODERATOR ROLE
router.use(_mod_role);
router.patch('/', editFeedback);
//ADMIN ROLE
router.use(_admin_role);

export default router;
