import { SubTasks } from '@prisma/client';
import { Server as WebSocketServer } from 'socket.io';
import { Level } from 'types/types';
import pc from 'picocolors';
// import { TasksServices } from '../services';
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
    this.io.on('connection', socket => {
      console.log(pc.cyan('Connect user with id ==>'), pc.blue(socket.id));

      socket.on('join', room => {
        console.log('room:', room);
        socket.join(room);
      });

      socket.on('leave', room => {
        console.log('leave room:', room);
        socket.leave(room);
      });

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
        console.log('User disconected ==>', socket.id);
      });
    });
  }
}

export default Sockets;
