import { Router } from 'express';
import { MailControllers } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import { uploads } from '../middlewares';
import { verifyAccessMail } from '../middlewares/mail.middleware';
const {
  showMessages,
  showMessage,
  archivedMessage,
  createMessage,
  createReplyMessage,
  createSeal,
  doneMessage,
  quantityFiles,
  updateMessage,
  showHoldingMessages,
  updateHoldingStage,
  archivedList,
} = new MailControllers();
class MailRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }

  private readonly optionMulter = [
    { name: 'mainProcedure', maxCount: 1 },
    { name: 'fileMail' },
  ];

  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    this.router.get('/imbox/quantity', quantityFiles);
    this.router.use(verifyAccessMail(['USER', 'MOD']));
    this.router.get('/', showMessages);
    this.router.get('/holding', showHoldingMessages);
    this.router.get('/:id', showMessage);
    this.router.post(
      '/',
      uploads.fileMail.fields(this.optionMulter),
      createMessage
    );
    this.router.put('/holding', updateHoldingStage);
    this.router.put(
      '/:id',
      uploads.fileMail.fields(this.optionMulter),
      updateMessage
    );
    this.router.post(
      '/:id/reply',
      uploads.fileMail.fields(this.optionMulter),
      createReplyMessage
    );
    this.router.post(
      '/reply-seal',
      uploads.fileMail.fields(this.optionMulter),
      createSeal
    );
    //MOD ROLE
    this.router.use(verifyAccessMail(['MOD']));
    this.router.patch('/archived/list', archivedList);
    this.router.patch('/archived/:id', archivedMessage);
    this.router.patch('/done/:id', doneMessage);
  }
}
const { router } = new MailRoutes();

export default router;
