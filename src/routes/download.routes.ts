import { Router } from 'express';
import DownloadController from '../controllers/download.controller';

const { basicLevel } = new DownloadController('level');
const { basicLevel: basicStage } = new DownloadController('stage');

class BasicLevelsRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.get('/basic-level/:id', basicLevel);
    this.router.get('/basic-stage/:id', basicStage);
  }
}

const { router } = new BasicLevelsRouter();
export default router;
