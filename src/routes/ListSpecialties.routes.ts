import { Router } from 'express';
import { authenticateHandler, role } from '../middlewares';
import { ListSpecialtiesController } from '../controllers';
class ListSpecialtiesRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);

    this.router.use(role.RoleHandler(['MOD'], 'grupos'));
    this.router.post('/', ListSpecialtiesController.create);
    this.router.get('/', ListSpecialtiesController.getAll);
    this.router.put('/:id', ListSpecialtiesController.update);
    this.router.delete('/:id', ListSpecialtiesController.delete);
  }
}
const { router } = new ListSpecialtiesRoutes();
export default router;
