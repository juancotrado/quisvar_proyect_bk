import { Router } from 'express';
import { BasicTaskControllers } from '../controllers';
const {
  create,
  find,
  delete: deleteTask,
  update,
  updateStatusSubTask,
  upperOrLower,
} = BasicTaskControllers;

class BasicLevelsRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.get('/:id', find);
    this.router.post('/', create);
    this.router.get('/status/:id', updateStatusSubTask);
    this.router.post('/:id', upperOrLower);
    this.router.put('/:id', update);
    this.router.delete('/:id', deleteTask);
  }
}
const { router } = new BasicLevelsRouter();
export default router;
