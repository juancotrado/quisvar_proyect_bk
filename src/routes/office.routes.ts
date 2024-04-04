import { Router } from 'express';
import { authenticateHandler } from '../middlewares';
import { OfficeControllers } from '../controllers';
const { showAll } = OfficeControllers;
class PDFGenerateRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.use(authenticateHandler);
    this.router.get('/', showAll);
  }
}

const { router } = new PDFGenerateRouter();
export default router;
