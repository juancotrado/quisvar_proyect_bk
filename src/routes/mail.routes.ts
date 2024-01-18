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
  declineVoucher,
  createVoucher,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  // _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { uploads } from '../middlewares';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/', showMessages);
router.get('/:id', showMessage);
router.get('/imbox/quantity', quantityFiles);
router.post('/', uploads.fileMail.array('fileMail'), createMessage);
router.put('/:id', uploads.fileMail.array('fileMail'), updateMessage);
//
// router.patch('/status/:id', updateTaskStatus);
// router.patch('/:id', taskVerify, assignedTask);
// router.get('/:id/subtasks', showSubtasksByIndexTask);
router.patch(
  '/voucher/:id',
  uploads.fileVoucher.array('fileMail'),
  createVoucher
);
//MOD ROLE
router.use(_mod_role);
router.post('/reply', uploads.fileMail.array('fileMail'), createReplyMessage);
router.patch('/archived/:id', archivedMessage);
router.patch('/done/:id', doneMessage);
router.delete('/voucher/:id', declineVoucher);

export default router;
