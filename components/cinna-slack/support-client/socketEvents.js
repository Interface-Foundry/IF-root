var ioClient = require('socket.io-client').connect("http://localhost:8000");
ioClient.on('connect', function() {
    console.log('Connected to cinna-slack client.')
})
exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
        console.log('connected to socket')
        socket.on('new message', function(msg) {
            msg.ts = new Date().toISOString();
            var type =  (msg.flags && msg.flags.toSupervisor) ? 'incoming' :  ((msg.flags && (msg.flags.toCinna || msg.flags.toClient)) ? 'outgoing' : ((msg.flags && msg.flags.searchResults) ? 'searchResults' : null) )
            // console.log('\nI/O: raw msg:', msg)
            switch(type) {
                case 'incoming':
                    console.log('\nI/O: routed to  --> incoming msg:\n')
                    socket.broadcast.emit('new bc message', msg)
                    break;
                case 'outgoing':
                    console.log('I/O: routed to --> outgoing msg\n')
                    ioClient.emit("msgFromSever", msg);
                    break;
                case 'searchResults':
                    console.log('I/O: routed to --> incoming results\n')
                    socket.broadcast.emit('results', msg)
                    break;
                default:
                    console.log('I/O: Could not determine message type.')
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
