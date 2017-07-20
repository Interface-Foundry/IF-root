const Server = require('socket.io');
let socket;

function startSocket(io) {
  socket = io;
  io.on('connection', (socket) => {
    // socket.emit('state', store.getState());
    socket.emit('state', 'hello!!');
    console.log('connected')
  });
}

module.exports = {
  startSocket: startSocket,
  getSocket: function () {
    return socket
  }
}
