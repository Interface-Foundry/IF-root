var ioClient = require('socket.io-client').connect("http://localhost:8000");
ioClient.on('connect', function() {
    console.log('Connected to cinna-slack client.')
})
exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
        console.log('connected to socket')
        socket.on('new message', function(msg) {
            console.log('socketEvents: new message from cinna received.', msg)
            msg.ts = new Date().toISOString()
            //Emit outgoing message to cinna-slack
            ioClient.emit("msgFromSever", msg);

            //Emit throughout supervisor client
            if(msg.bucket === 'supervisor') {
                socket.broadcast.emit('new bc message', msg);
            }
        });
        socket.on('new channel', function(channel) {
            socket.broadcast.emit('new channel', channel)
        });
        socket.on('typing', function() {
            socket.broadcast.emit('typing bc', socket.username);
        });
        socket.on('stop typing', function() {
            socket.broadcast.emit('stop typing bc', socket.username);
        });
    });
}
// var io = require('socket.io').listen(app);
// io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res});