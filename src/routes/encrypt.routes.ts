import { Router } from 'express';
import { PDFGenerateController } from '../controllers';
import tmp from 'tmp';
import {
  PdfGenerateMiddleware,
  authenticateHandler,
  uploads,
} from '../middlewares';

const { crypt, decrypt, removeSign } = new PDFGenerateController();
const { verifyToken } = new PdfGenerateMiddleware();

class EncryptRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes(): void {
    tmp.setGracefulCleanup();
    this.router.use(verifyToken);
    this.router.get('/:dni', decrypt);
    this.router.use(authenticateHandler);
    this.router.use(uploads.singImg.single('file'));
    this.router.post('/', crypt);
    this.router.delete('/', removeSign);
  }
}

const { router } = new EncryptRouter();
export default router;
