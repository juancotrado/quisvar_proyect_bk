import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { prisma } from '../utils/prisma.server';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';

import {
  userRouter,
  authRouter,
  projectRouter,
  subTaskRouter,
  profileRouter,
  speacilitiesRouter,
  filesRouter,
  reportsRouter,
  feedbacksRouter,
  duplicatesRouter,
  archiverRouter,
  stagesRouter,
  typeSpecialityRouter,
  sectorRouter,
  levelsRouter,
  listRouter,
  licenseRouter,
  mailRouter,
} from '../routes';
import AppError from '../utils/appError';
import globalErrorHandler from '../middlewares/error.middleware';
import morgan from 'morgan';
import Sockets from './sockets';
import { verifySecretEnv } from '../middlewares/auth.middleware';
import TimerCron from './timer';
import { setAdmin } from '../utils/tools';

dotenv.config();
class Server {
  private app!: Application;
  private io: WebSocketServer;
  private httpServer: http.Server;
  private PORT: string = process.env.PORT || '8080';
  private HOST: string = process.env.HOST || 'localhost';
  private path = {
    auth: `/${process.env.ROUTE}/auth/login`,
    users: `/${process.env.ROUTE}/users`,
    profile: `/${process.env.ROUTE}/profile`,
    specialities: `/${process.env.ROUTE}/specialities`,
    projects: `/${process.env.ROUTE}/projects`,
    subtasks: `/${process.env.ROUTE}/subtasks`,
    files: `/${process.env.ROUTE}/files`,
    reports: `/${process.env.ROUTE}/reports`,
    feedbacks: `/${process.env.ROUTE}/feedbacks`,
    duplicates: `/${process.env.ROUTE}/duplicates`,
    archiver: `/${process.env.ROUTE}/archiver`,
    stages: `/${process.env.ROUTE}/stages`,
    typespecialities: `/${process.env.ROUTE}/typespecialities`,
    sector: `/${process.env.ROUTE}/sector`,
    levels: `/${process.env.ROUTE}/levels`,
    resource: `/${process.env.ROUTE}/resource`,
    list: `/${process.env.ROUTE}/list`,
    license: `/${process.env.ROUTE}/license`,
    mail: `/${process.env.ROUTE}/mail`,
  };

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.conectionCron();
    this.io = new WebSocketServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    });
    this.conectionWebSockect();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use('/static', express.static('uploads/projects'));
    this.app.use('/models', express.static('uploads/models'));
    this.app.use('/reviews', express.static('uploads/reviews'));
    this.app.use('/file-user', express.static('public'));
    this.app.use('/general', express.static('public/general'));
    this.app.use('/reports', express.static('public/reports'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(morgan('dev'));
    this.app.use(verifySecretEnv);
  }
  conectionCron() {
    new TimerCron();
  }
  conectionWebSockect() {
    new Sockets(this.io);
  }
  routes() {
    this.app.use(this.path.auth, authRouter);
    this.app.use(this.path.users, userRouter);
    this.app.use(this.path.profile, profileRouter);
    this.app.use(this.path.projects, projectRouter);
    this.app.use(this.path.specialities, speacilitiesRouter);
    this.app.use(this.path.subtasks, subTaskRouter);
    this.app.use(this.path.files, filesRouter);
    this.app.use(this.path.reports, reportsRouter);
    this.app.use(this.path.feedbacks, feedbacksRouter);
    this.app.use(this.path.duplicates, duplicatesRouter);
    this.app.use(this.path.archiver, archiverRouter);
    this.app.use(this.path.stages, stagesRouter);
    this.app.use(this.path.typespecialities, typeSpecialityRouter);
    this.app.use(this.path.sector, sectorRouter);
    this.app.use(this.path.levels, levelsRouter);
    this.app.use(this.path.list, listRouter);
    this.app.use(this.path.license, licenseRouter);
    this.app.use(this.path.mail, mailRouter);
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      return next(
        new AppError(`can't find ${req.originalUrl} on this server`, 404)
      );
    });
    this.app.use(globalErrorHandler);
  }
  listen() {
    this.httpServer.listen(this.PORT, async () => {
      if (this.PORT && this.HOST) {
        prisma;
        console.log(
          `Servidor desplegado en 🚀 ==> http://${this.HOST}:${this.PORT}/`
        );
        await setAdmin();
      } else {
        console.log('No se pudo conectar al servidor 😥');
      }
    });
  }
}
export default Server;
