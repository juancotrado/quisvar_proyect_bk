import { Router } from 'express';
import { BasicLevelsController } from '../controllers';
const { create, findByStage, delete: deleteStage } = BasicLevelsController;

class BasicLevelsRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.post('/', create);
    this.router.get('/:id', findByStage);
    this.router.delete('/:id', deleteStage);
  }
}
const { router } = new BasicLevelsRouter();
export default router;
