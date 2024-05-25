import { Router } from 'express';
import DownloadController from '../controllers/download.controller';

const { basicLevel, firstRoute, redirect, mergePdfLevel } =
  new DownloadController('level');
const { basicLevel: basicStage, mergePdfLevel: mergeStage } =
  new DownloadController('stage');

class BasicLevelsRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }

  private setUpRoutes() {
    this.router.get('/first-route', firstRoute);
    this.router.get('/redirect/:uuid', redirect);
    this.router.get('/basic-level/:id', basicLevel);
    this.router.get('/basic-stage/:id', basicStage);
    this.router.get('/merge-basic-stage/:id', mergeStage);
    this.router.get('/merge-basic-level/:id', mergePdfLevel);
  }
}

const { router } = new BasicLevelsRouter();
export default router;
