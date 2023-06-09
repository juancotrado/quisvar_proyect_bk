import { SubTasks } from '@prisma/client';
import { NextFunction } from 'express';
import { Server as WebSocketServer } from 'socket.io';
// import { TasksServices } from '../services';

class Sockets {
  private io: WebSocketServer;
  constructor(io: WebSocketServer) {
    this.io = io;
    this.socketEvents();
  }
  roomPlace(subTask: SubTasks) {
    const room = subTask.indexTaskId
      ? subTask.indexTaskId + 'indextask'
      : subTask.taskId
      ? subTask.taskId + 'task'
      : subTask.task_2_Id
      ? subTask.task_2_Id + 'task2'
      : subTask.task_3_Id + 'task3';
    return room;
  }
  socketEvents() {
    this.io.on('connection', socket => {
      console.log('Connect user with id ==>', socket.id);
      socket.on('join', room => {
        socket.join(room);
      });
      socket.on('client:update-subTask', (subTask: SubTasks) => {
        const room = this.roomPlace(subTask);
        this.io.to(room).emit('server:update-subTask', subTask);
      });
      socket.on('client:create-subTask', (subTask: SubTasks) => {
        const room = this.roomPlace(subTask);
        this.io.to(room).emit('server:create-subTask', subTask);
      });
      socket.on('client:delete-subTask', (subTasks: SubTasks[]) => {
        const room = this.roomPlace(subTasks[0]);
        if (!subTasks[0].id) {
          return this.io.to(room).emit('server:delete-subTask', []);
        }
        this.io.to(room).emit('server:delete-subTask', subTasks);
      });
      socket.on('disconnect', () => {
        console.log('User disconected ==>', socket.id);
      });
    });
  }
}

export default Sockets;
