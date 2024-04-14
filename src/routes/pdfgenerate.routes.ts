import { Router } from 'express';
import { PDFGenerateController } from '../controllers';
import tmp from 'tmp';
import { uploads } from '../middlewares';

const { pagesInPage, pagesInCover, pagesInSeal } = new PDFGenerateController();
class PDFGenerateRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    tmp.setGracefulCleanup();
    this.router.use(uploads.PDF_Files.single('file'));
    this.router.post('/two-pages', pagesInPage);
    this.router.post('/cover', pagesInCover);
    this.router.post('/seal-paymessage/:id', pagesInSeal);
  }
}

const { router } = new PDFGenerateRouter();
export default router;
