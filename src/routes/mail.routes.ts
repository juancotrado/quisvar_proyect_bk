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

import { role, uploads } from '../middlewares';

const router = Router();

router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(role.RoleHandler('USER', 'tramites', 'tramite-de-pago'));
router.get('/', showMessages);
router.get('/:id', showMessage);
router.get('/imbox/quantity', quantityFiles);
router.post('/', uploads.fileMail.array('fileMail'), createMessage);
router.put('/:id', uploads.fileMail.array('fileMail'), updateMessage);
router.patch(
  '/voucher/:id',
  uploads.fileVoucher.array('fileMail'),
  createVoucher
);

//MOD ROLE
router.use(role.RoleHandler('MOD', 'tramites', 'tramite-de-pago'));
router.post('/reply', uploads.fileMail.array('fileMail'), createReplyMessage);
router.patch('/archived/:id', archivedMessage);
router.patch('/done/:id', doneMessage);
router.delete('/voucher/:id', declineVoucher);

export default router;
