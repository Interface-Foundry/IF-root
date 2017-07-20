const Server = require('socket.io');

function startSocket(io) {
  io.on('connection', (socket) => {
    // socket.emit('state', store.getState());
    socket.emit('state', 'hello!!');
    console.log('connected')
  });
}

module.exports = {
  startSocket: startSocket
}