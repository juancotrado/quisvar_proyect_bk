import { Router } from 'express';
import DownloadController from '../controllers/download.controller';

const {
  basicLevel,
  firstRoute,
  redirect,
  mergePdfLevel,
  mergePdfLevel2,
  compressPdf,
  compressPdfStage,
  mergePdfStage,
} = new DownloadController('level');
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
    this.router.get('/merge-pdf-levels/:id', mergePdfLevel2);
    this.router.get('/compress-pdfs/:id', compressPdf);
    this.router.get('/stage-compress-pdfs/:id', compressPdfStage);
    this.router.get('/merge-pdf-stage/:id', mergePdfStage);
  }
}

const { router } = new BasicLevelsRouter();
export default router;
