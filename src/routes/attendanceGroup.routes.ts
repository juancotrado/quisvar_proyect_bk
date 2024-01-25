import { Router } from 'express';
import { authenticateHandler, role, uploads } from '../middlewares';
import { AttendanceGroupControllers } from '../controllers';
class AttendanceGroupRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }
  protected setUpRouter(): void {
    this.router.use(authenticateHandler);
    this.router.use(role.mod);
    this.router.get(
      '/users/:groupId',
      AttendanceGroupControllers.getUsersGroup
    );
    //Group List
    this.router.post('/list', AttendanceGroupControllers.createList);
    this.router.patch('/list/title/:id', AttendanceGroupControllers.editTitle);
    this.router.get('/list/:id', AttendanceGroupControllers.getList);
    this.router.delete(
      '/list/:id',
      AttendanceGroupControllers.deleteListAttendance
    );
    //Group List File
    this.router.patch(
      '/list/file/:id',
      uploads.fileGroup.array('file'),
      AttendanceGroupControllers.updateListFile
    );
    this.router.delete(
      '/list/file/:id',
      AttendanceGroupControllers.deleteListFile
    );
    //Attendance Group
    this.router.post('/relation', AttendanceGroupControllers.createAttendance);
    this.router.patch('/:id', AttendanceGroupControllers.updateAttendance);
  }
}
const { router } = new AttendanceGroupRoutes();
export default router;
