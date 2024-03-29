import { Router } from 'express';
import { MailControllers } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import { role, uploads } from '../middlewares';
const {
  createMessage,
  showMessage,
  showMessages,
  archivedMessage,
  createReplyMessage,
  doneMessage,
  quantityFiles,
  updateMessage,
} = new MailControllers();
class MailRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    this.router.get('/imbox/quantity', quantityFiles);
    this.router.use(
      role.RoleHandler(['MOD', 'USER'], 'tramites', 'comunicado')
    );
    this.router.get('/', showMessages);
    this.router.get('/:id', showMessage);
    this.router.use(role.RoleHandler(['MOD'], 'tramites', 'comunicado'));
    this.router.get('/imbox/quantity', quantityFiles);
    this.router.post('/', uploads.fileMail.array('fileMail'), createMessage);
    this.router.put('/:id', uploads.fileMail.array('fileMail'), updateMessage);
    this.router.post(
      '/:id/reply',
      uploads.fileMail.array('fileMail'),
      createReplyMessage
    );
    this.router.patch('/:id/archived', archivedMessage);
    this.router.patch('/:id/done', doneMessage);
  }
}
const { router } = new MailRoutes();

export default router;
