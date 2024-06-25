import { Router } from 'express';
import { BasicTaskControllers, BasicTaskOnUserServices } from '../controllers';
const {
  create,
  find,
  delete: deleteTask,
  update,
  updateStatusSubTask,
  upperOrLower,
  restore,
  sortTasks,
} = BasicTaskControllers;
const { addUser, removeUser, addMod, removeMod } = BasicTaskOnUserServices;
class BasicLevelsRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.get('/:id', find);
    this.router.post('/', create);
    this.router.patch('/sorting-task', sortTasks);
    this.router.get('/status/:id', updateStatusSubTask);
    this.router.post('/add-user', addUser);
    this.router.post('/add-mod', addMod);
    this.router.post('/:id', upperOrLower);
    this.router.put('/:id', update);
    this.router.delete('/:id', deleteTask);
    this.router.delete('/:id/restore', restore);
    this.router.delete('/remove-user/:id', removeUser);
    this.router.delete('/remove-mod/:id', removeMod);
  }
}
const { router } = new BasicLevelsRouter();
export default router;
