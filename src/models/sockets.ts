import { SubTasks } from '@prisma/client';
import { Server as WebSocketServer, Socket } from 'socket.io';
import { CatchAsync, Level } from 'types/types';
import pc from 'picocolors';
import { authSocket } from '../socket/middlewares';
import {
  basicSocketCotroller,
  basicTaskSocketCotroller,
  budgetSocketCotroller,
} from '../socket/controllers';
import AppError from '../utils/appError';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface DataProjectAndTask {
  project: Level;
  task: SubTasks;
}
class Sockets {
  private io: WebSocketServer;
  constructor(io: WebSocketServer) {
    this.io = io;
    this.socketEvents();
  }
  roomPlace(subTask: SubTasks) {
    const room = subTask.levels_Id;
    return room;
  }

  socketEvents() {
    this.io.use(authSocket);
    this.io.on('connection', socket => {
      const { user } = socket.data;
      socket.join(user.id);
      console.log(
        pc.cyan('User'),
        pc.blue(user.profile.firstName),
        pc.cyan('connected successfully')
      );

      socket.on('join', room => {
        console.log('room:', room);
        socket.join(room);
      });

      socket.on('leave', room => {
        console.log('leave room:', room);
        socket.leave(room);
      });

      const handleSocketController = (
        controller: (
          socket: Socket,
          io: WebSocketServer,
          catchAsyncSocket?: CatchAsync
        ) => void
      ) => {
        const catchAsyncSocket = <T>(handler: Function) => {
          return async (...args: T[]) => {
            try {
              await handler(...args);
            } catch (error) {
              console.log('capturador de errores', error);
              if (
                error instanceof AppError ||
                error instanceof PrismaClientKnownRequestError
              )
                socket.emit('server:error', error.message);
            }
          };
        };
        controller(socket, this.io, catchAsyncSocket);
      };

      //controllers
      handleSocketController(basicSocketCotroller);
      handleSocketController(budgetSocketCotroller);
      handleSocketController(basicTaskSocketCotroller);

      //other
      socket.on('client:update-projectAndTask', (data: DataProjectAndTask) => {
        const { project, task } = data;
        this.io.to(`task-${task.id}`).emit('server:update-subTask', task);
        this.io
          .to(`project-${project.stagesId}`)
          .emit('server:update-project', project);
      });

      socket.on('client:update-task', (task: SubTasks) => {
        this.io.to(`task-${task.id}`).emit('server:update-subTask', task);
      });

      socket.on('client:update-project', (project: Level) => {
        this.io
          .to(`project-${project.stagesId}`)
          .emit('server:update-project', project);
      });

      socket.on('client:call-notification', () => {
        this.io.emit('server:call-notification');
      });

      socket.on('client:refresh-user', roleId => {
        this.io.to(`role-${roleId}`).emit('server:refresh-user');
      });

      socket.on('client:action-button', () => {
        this.io.emit('server:action-button');
      });

      socket.on('client:action-button', () => {
        this.io.emit('server:license-update');
      });

      socket.on('disconnect', () => {
        console.log('User disconected ==>', user.profile.firstName);
        socket.leave(user.id);
      });
    });
  }
}

export default Sockets;
