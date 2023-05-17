import { Server as WebSocketServer } from 'socket.io';
import { TasksServices } from '../services';

class Sockets {
  private io: WebSocketServer;
  constructor(io: WebSocketServer) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    this.io.on('connection', socket => {
      console.log('Connect user with id ==>', socket.id);
      socket.on('data', tasks => {
        socket.broadcast.emit('data', tasks);
      });
      socket.on('update-status', async data => {
        const result = await TasksServices.updateStatus(data.id, data.body);
        console.log('complete update status', result);
      });
      socket.on('disconnect', () => {
        console.log('User disconected ==>', socket.id);
      });
    });
  }
}

export default Sockets;
