import { Router } from 'express';
import { authenticateHandler, role } from '../middlewares';
import { DutyControllers } from '../controllers';
class DutyRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    this.router.use(role.mod);
    this.router.post('/', DutyControllers.createDuty);
    this.router.patch('/:id', DutyControllers.updateDuty);
  }
}
const { router } = new DutyRoutes();
export default router;