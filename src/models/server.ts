import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { prisma } from '../utils/prisma.server';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';
import {
  userRouter,
  taskRouter,
  authRouter,
  workareasRouter,
  projectRouter,
  subTaskRouter,
  indexTasksRouter,
  profileRouter,
  speacilitiesRouter,
  filesRouter,
  taskLvl_2Router,
  taskLvl_3Router,
  reportsRouter,
  feedbacksRouter,
  duplicatesRouter,
  archiverRouter,
  stagesRouter,
  typeSpecialityRouter,
  sectorRouter,
} from '../routes';
import AppError from '../utils/appError';
import globalErrorHandler from '../middlewares/error.middleware';
import morgan from 'morgan';
import Sockets from './sockets';
import { verifySecretEnv } from '../middlewares/auth.middleware';

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
    workareas: `/${process.env.ROUTE}/workareas`,
    indextasks: `/${process.env.ROUTE}/indextasks`,
    tasks: `/${process.env.ROUTE}/tasks`,
    tasks2: `/${process.env.ROUTE}/tasks2`,
    tasks3: `/${process.env.ROUTE}/tasks3`,
    subtasks: `/${process.env.ROUTE}/subtasks`,
    files: `/${process.env.ROUTE}/files`,
    reports: `/${process.env.ROUTE}/reports`,
    feedbacks: `/${process.env.ROUTE}/feedbacks`,
    duplicates: `/${process.env.ROUTE}/duplicates`,
    archiver: `/${process.env.ROUTE}/archiver`,
    stages: `/${process.env.ROUTE}/stages`,
    typespecialities: `/${process.env.ROUTE}/typespecialities`,
    sector: `/${process.env.ROUTE}/sector`,
  };

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
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
    this.app.use('/static', express.static('uploads'));
    this.app.use('/models', express.static('file_model'));
    this.app.use('/review', express.static('file_review'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(morgan('dev'));
    this.app.use(verifySecretEnv);
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
    this.app.use(this.path.workareas, workareasRouter);
    this.app.use(this.path.indextasks, indexTasksRouter);
    this.app.use(this.path.tasks, taskRouter);
    this.app.use(this.path.tasks2, taskLvl_2Router);
    this.app.use(this.path.tasks3, taskLvl_3Router);
    this.app.use(this.path.subtasks, subTaskRouter);
    this.app.use(this.path.files, filesRouter);
    this.app.use(this.path.reports, reportsRouter);
    this.app.use(this.path.feedbacks, feedbacksRouter);
    this.app.use(this.path.duplicates, duplicatesRouter);
    this.app.use(this.path.archiver, archiverRouter);
    this.app.use(this.path.stages, stagesRouter);
    this.app.use(this.path.typespecialities, typeSpecialityRouter);
    this.app.use(this.path.sector, sectorRouter);
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      return next(
        new AppError(`can't find ${req.originalUrl} on this server`, 404)
      );
    });
    this.app.use(globalErrorHandler);
  }
  listen() {
    this.httpServer.listen(this.PORT, () => {
      if (this.PORT && this.HOST) {
        prisma;
        console.log(
          `Servidor desplegado en 🚀 ==> http://${this.HOST}:${this.PORT}/`
        );
      } else {
        console.log('No se pudo conectar al servidor 😥');
      }
    });
  }
}
export default Server;
