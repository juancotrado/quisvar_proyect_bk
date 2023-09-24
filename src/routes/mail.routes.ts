import { Router } from 'express';
import {
  showMessages,
  createMessage,
  showMessage,
  quantityFiles,
  updateMessage,
  archivedMessage,
  doneMessage,
  createReplyMessage,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { uploadFileMail } from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showMessages);
router.get('/:id', showMessage);
router.get('/imbox/quantity', quantityFiles);
router.post('/', uploadFileMail.array('fileMail'), createMessage);
router.put('/:id', uploadFileMail.array('fileMail'), updateMessage);
//
// router.patch('/status/:id', updateTaskStatus);
// router.get('/:id/subtasks', showSubtasksByIndexTask);
// router.patch('/:id', taskVerify, assignedTask);
//MOD ROLE
router.use(_mod_role);
router.post('/reply', uploadFileMail.array('fileMail'), createReplyMessage);
router.patch('/archived/:id', archivedMessage);
router.patch('/done/:id', doneMessage);

export default router;
