import { Router } from 'express';
import { PDFGenerateController } from '../controllers';
import tmp from 'tmp';
import { PdfGenerateMiddleware, uploads } from '../middlewares';

const { crypt, decrypt } = new PDFGenerateController();
const { verifyToken } = new PdfGenerateMiddleware();

class EncryptRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    tmp.setGracefulCleanup();
    this.router.use(verifyToken);
    this.router.get('/:id', decrypt);
    this.router.use(uploads.singImg.single('file'));
    this.router.post('/', crypt);
  }
}

const { router } = new EncryptRouter();
export default router;
