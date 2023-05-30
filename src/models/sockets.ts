import { NextFunction } from 'express';
import { Server as WebSocketServer } from 'socket.io';
// import { TasksServices } from '../services';

class Sockets {
  private io: WebSocketServer;
  constructor(io: WebSocketServer) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    this.io.on('connection', socket => {
      console.log('Connect user with id ==>', socket.id);
      socket.on('join', room => {
        socket.join(room);
      });

      socket.on('client:update-subTask', subTask => {
        this.io.to(subTask.taskId).emit('server:update-subTask', subTask);
      });
      socket.on('client:upload-file-subTask', subTask => {
        this.io
          .to(subTask.taskId)
          .emit('server:client:upload-file-subTask', subTask);
        this.io.to(subTask.taskId).emit('server:update-subTask', subTask);
      });

      // socket.on('data', tasks => {
      //   socket.broadcast.emit('data', tasks);
      // });
      // this.io.engine.use((req: Request, res: Response, next: NextFunction) => {
      //   console.log('awa');
      // });
      // socket.on('update-status', async data => {
      //   const statusAsiged = {
      //     PROCESS: 'apply',
      //     UNRESOLVED: 'decline',
      //     DONE: 'done',
      //   };
      //   const { status } = data.body;
      //   if (statusAsiged[status as keyof typeof statusAsiged]) {
      //     await TasksServices.assigned(
      //       data.id,
      //       data.userId,
      //       statusAsiged[status as keyof typeof statusAsiged]
      //     );
      //   }
      //   const result = await TasksServices.updateStatus(data.id, data.body);
      //   console.log('complete update status', result);
      // });
      // socket.on('create-task', async task => {
      //   const newTask = await TasksServices.create(task);
      //   this.io.emit('add-task', newTask);
      // });
      // socket.on('edit-task', async task => {
      //   console.log(task);
      //   const newTask = await TasksServices.update(task.id, task);
      //   this.io.emit('update-task', newTask);
      // });
      // socket.on('delete-task', async id => {
      //   this.io.emit('delete-task-success', id);
      //   await TasksServices.delete(id);
      //   console.log('se elimino correctamente la tarea');
      // });
      socket.on('disconnect', () => {
        console.log('User disconected ==>', socket.id);
      });
    });
  }
}

export default Sockets;
