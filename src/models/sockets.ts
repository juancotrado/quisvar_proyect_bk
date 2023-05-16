import { Server as WebSocketServer } from 'socket.io';

class Sockets {
  private io: WebSocketServer;
  constructor(io: WebSocketServer) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    this.io.on('connection', socket => {
      console.log('Connect user with id ==>', socket.id);
      socket.on('data', value => {
        socket.broadcast.emit('data', value);
      });
    });
  }
}

export default Sockets;
