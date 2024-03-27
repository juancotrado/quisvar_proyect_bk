import { Router } from 'express';
import { InitialRouter } from 'types/patterns';
import { authenticateHandler, uploads } from '../middlewares';
import { PayMailControllers } from '../controllers';

const {
  showMessages,
  showMessage,
  archivedMessage,
  createMessage,
  createReplyMessage,
  createVoucher,
  declineVoucher,
  doneMessage,
  quantityFiles,
  updateMessage,
} = PayMailControllers;

class PayMailRoutes implements InitialRouter {
  public router: Router;

  constructor() {
    // super();
    this.router = Router();
    this.setUpRouter();
  }

  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    // this.router.use(role.employee);
    //EMPLOYEE ROLE
    // router.use(role.RoleHandler('USER', 'tramites', 'tramite-de-pago'));
    this.router.get('/', showMessages);
    this.router.get('/:id', showMessage);
    this.router.get('/imbox/quantity', quantityFiles);
    this.router.post(
      '/',
      uploads.fileMail.fields([
        { name: 'mainProcedure', maxCount: 1 },
        { name: 'fileMail' },
      ]),
      createMessage
    );
    this.router.put(
      '/:id',
      uploads.fileMail.fields([
        { name: 'mainProcedure' },
        { name: 'fileMail' },
      ]),
      updateMessage
    );
    this.router.patch(
      '/voucher/:id',
      uploads.fileVoucher.array('fileMail'),
      createVoucher
    );
    //MOD ROLE
    // router.use(role.RoleHandler('MOD', 'tramites', 'tramite-de-pago'));
    this.router.patch('/archived/:id', archivedMessage);
    this.router.patch('/done/:id', doneMessage);
    this.router.delete('/voucher/:id', declineVoucher);
    this.router.post(
      '/reply',
      uploads.fileMail.fields([
        { name: 'mainProcedure' },
        { name: 'fileMail' },
      ]),
      createReplyMessage
    );
  }
}
const { router } = new PayMailRoutes();
export default router;
