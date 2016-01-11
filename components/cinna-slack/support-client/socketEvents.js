var ioClient = require('socket.io-client').connect("http://localhost:8000");
ioClient.on('connect', function() {
    console.log('Connected to cinna-slack client.')
})
exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
        console.log('connected to socket')
        socket.on('new message', function(msg) {
            
            msg.ts = new Date().toISOString()
            //Emit throughout supervisor client
            if(msg.bucket === 'supervisor') {
                console.log('socketEvents: new message from cinna received.')
                socket.broadcast.emit('new bc message', msg);
            }
            else if (msg.client_res.msg && msg.client_res.msg.length) {
                // console.log('Sending message to client.', msg)
                //Emit outgoing message to cinna-slack
                ioClient.emit("msgFromSever", msg);
            } else if (msg.bucket === 'results'){
                console.log('Received results from cinna')
                socket.broadcast.emit('results', msg)
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

        socket.on('change state', function(state) {
            socket.emit('change state bc', state);
        });

        socket.on('change channel', function(channel) {
            socket.emit('change channel bc', channel);
        });

        socket.on('disconnect', function(socket) {
            socket.emit('disconnect bc', socket);
        });

    });
}
// var io = require('socket.io').listen(app);
// io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res});