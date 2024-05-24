import { Router } from 'express';
import { BasicLevelsController } from '../controllers';
const {
  create,
  update,
  upperOrLower,
  delete: deleteStage,
  findById,
  updateCover,
} = BasicLevelsController;

class BasicLevelsRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.post('/', create);
    this.router.get('/:id', findById);
    this.router.post('/:id', upperOrLower);
    this.router.put('/:id', update);
    this.router.patch('/updates-covers', updateCover);
    this.router.patch('/updates-days', updateCover);
    this.router.delete('/:id', deleteStage);
  }
}
const { router } = new BasicLevelsRouter();
export default router;
