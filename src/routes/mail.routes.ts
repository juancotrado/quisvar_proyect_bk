import { Router } from 'express';
import { MailControllers } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import { uploads } from '../middlewares';
const { createMessage, showMessage, showMessages } = new MailControllers();
class MailRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    this.router.post('/', uploads.fileMail.array('fileMail'), createMessage);
    this.router.get('/', showMessages);
    this.router.get('/:id', showMessage);
  }
}
const { router } = new MailRoutes();

export default router;
// const router = Router();

// router.use(authenticateHandler);
// //EMPLOYEE ROLE
// // router.use(role.RoleHandler('USER', 'tramites', 'tramite-de-pago'));
// router.get('/', showMessages);
// router.get('/:id', showMessage);
// router.get('/imbox/quantity', quantityFiles);
// router.post('/', uploads.fileMail.array('fileMail'), createMessage);
// router.put('/:id', uploads.fileMail.array('fileMail'), updateMessage);
// router.patch(
//   '/voucher/:id',
//   uploads.fileVoucher.array('fileMail'),
//   createVoucher
// );

// //MOD ROLE
// // router.use(role.RoleHandler('MOD', 'tramites', 'tramite-de-pago'));
// router.post('/reply', uploads.fileMail.array('fileMail'), createReplyMessage);
// router.patch('/archived/:id', archivedMessage);
// router.patch('/done/:id', doneMessage);
// router.delete('/voucher/:id', declineVoucher);

// export default router;
