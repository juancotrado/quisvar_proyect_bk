import express, { Application } from 'express';
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
} from '../routes';
import AppError from '../utils/appError';
import globalErrorHandler from '../middlewares/error.middleware';
import morgan from 'morgan';
import Sockets from './sockets';

dotenv.config();
class Server {
  private app!: Application;
  private io: WebSocketServer;
  private httpServer: http.Server;
  private PORT: string = process.env.PORT || '8080';
  private HOST: string = process.env.HOST || 'localhost';
  private path: any = {
    auth: `/${process.env.ROUTE}/auth/login`,
    users: `/${process.env.ROUTE}/users`,
    workareas: `/${process.env.ROUTE}/workareas`,
    projects: `/${process.env.ROUTE}/projects`,
    tasks: `/${process.env.ROUTE}/tasks`,
    subtasks: `/${process.env.ROUTE}/subtasks`,
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
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  conectionWebSockect() {
    new Sockets(this.io);
  }
  routes() {
    this.app.use(this.path.users, userRouter);
    this.app.use(this.path.tasks, taskRouter);
    this.app.use(this.path.projects, projectRouter);
    this.app.use(this.path.workareas, workareasRouter);
    this.app.use(this.path.auth, authRouter);
    this.app.use(this.path.subtasks, subTaskRouter);
    this.app.all('*', (req, res, next) => {
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
          `Server has running in 🚀 ==> http://${this.HOST}:${this.PORT}/`
        );
      } else {
        console.log('Could not connect to server 😥');
      }
    });
  }
}
export default Server;
