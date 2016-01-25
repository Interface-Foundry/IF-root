var ioClient = require('socket.io-client').connect("http://localhost:8000");
ioClient.on('connect', function() {
    console.log('Connected to cinna-slack client.')
})
exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
        console.log('connected to socket')

        socket.on('new message', function(msg) {
            msg.ts = new Date().toISOString();
            console.log('\nSE: raw msg -->\n', msg.bucket, msg.msg)
            //Emit throughout supervisor client
            if(msg.bucket === 'supervisor') {
                console.log('\nSE: incoming msg -->\n', msg.bucket, msg.msg)
                socket.broadcast.emit('new bc message', msg);
            }
            //Emit outgoing message to cinna-slack
            else if (msg.client_res[0] && msg.client_res[0].length > 0 && (msg.bucket === 'response' || msg.bucket === 'search') ) {
                console.log('SE: outgoing msg -->', msg.bucket, msg.msg)
                ioClient.emit("msgFromSever", msg);
            } else if (msg.bucket === 'results'){
                console.log('SE: incoming results -->', msg.bucket, msg.msg)
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

        // socket.on('disconnect', function(socket) {
        //     socket.emit('disconnect bc', socket);
        // });

    });
}
