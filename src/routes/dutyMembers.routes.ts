import { Router } from 'express';
import { authenticateHandler, role } from '../middlewares';
import { DutyMembersControllers } from '../controllers';
class DutyMembersRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);

    this.router.use(role.RoleHandler(['MOD'], 'grupos'));
    this.router.post('/:id', DutyMembersControllers.createDutyMember);
    this.router.get('/week/:groupId?', DutyMembersControllers.getWeekTask);
    this.router.get('/report/:groupId?', DutyMembersControllers.getWeekReport);
    this.router.delete('/:id', DutyMembersControllers.deleteDutyMember);
  }
}
const { router } = new DutyMembersRoutes();
export default router;
