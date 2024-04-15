import { Router } from 'express';
import { MailControllers } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import { role, uploads } from '../middlewares';
import { verifyAccessMail } from '../middlewares/mail.middleware';
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
    this.router.use(verifyAccessMail(['USER', 'MOD']));
    this.router.get('/', showMessages);
    this.router.get('/:id', showMessage);
    this.router.use(verifyAccessMail(['MOD']));
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
