import { Router } from 'express';
import { BasicLevelsController } from '../controllers';
const { create } = BasicLevelsController;

class BasicLevelsRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.post('/', create);
    this.router.delete('/', create);
  }
}
const { router } = new BasicLevelsRouter();
export default router;
