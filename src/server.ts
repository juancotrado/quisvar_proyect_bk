import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import { prisma } from './utils/prisma.server';
import { userRouter, taskRouter } from './routes';

dotenv.config();
class Server {
  private app!: Application;
  private PORT: string = process.env.PORT || '8080';
  private HOST: string = process.env.HOST || 'localhost';
  private path: any = {
    users: `/${process.env.ROUTE}/users`,
    tasks: `/${process.env.ROUTE}/tasks`,
  };

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }
  middlewares() {}
  routes() {
    this.app.use(this.path.users, userRouter);
    this.app.use(this.path.tasks, taskRouter);
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

// const PORT = process.env.PORT;
// const HOST = process.env.HOST;
