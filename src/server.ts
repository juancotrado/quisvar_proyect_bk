import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import { prisma } from './utils/prisma.server';
import { userRouter, taskRouter, authRouter } from './routes';
// import { handleError } from './middlewares';
import AppError from './utils/appError';
import globalErrorHandler from './middlewares/error.middleware';

dotenv.config();
class Server {
  private app!: Application;
  private PORT: string = process.env.PORT || '8080';
  private HOST: string = process.env.HOST || 'localhost';
  private path: any = {
    users: `/${process.env.ROUTE}/users`,
    tasks: `/${process.env.ROUTE}/tasks`,
    auth: `/${process.env.ROUTE}/auth/login`,
  };

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    // this.handleError();
  }
  middlewares() {
    this.app.use(express.json());
  }
  routes() {
    this.app.use(this.path.users, userRouter);
    this.app.use(this.path.tasks, taskRouter);
    this.app.use(this.path.auth, authRouter);
    this.app.all('*', (req, res, next) => {
      return next(
        new AppError(`can't find ${req.originalUrl} on this server`, 404)
      );
    });
    this.app.use(globalErrorHandler);
  }
  listen() {
    this.app.listen(this.PORT, () => {
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
