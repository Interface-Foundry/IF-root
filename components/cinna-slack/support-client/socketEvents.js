var ioClient = require('socket.io-client').connect("http://localhost:8000");
ioClient.on('connect', function() {
    console.log('Connected to cinna-slack client.')
})
var Channel = require('./server/models/Channel');
var shortid = require('shortid');

exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
        console.log('connected to socket')
        socket.on('new message', function(msg) {
          Channel.findOne({id: msg.source.id}, function(err, chan) {
            msg.ts = new Date().toISOString();
            var type =  (msg.flags && msg.flags.toSupervisor) ? 'incoming' :  ((msg.flags && (msg.flags.toCinna || msg.flags.toClient)) ? 'outgoing' : ((msg.flags && msg.flags.searchResults) ? 'searchResults' : null) )
            // console.log('\nI/O: raw msg:', msg)
            switch(type) {
                case 'incoming':
                    console.log('\nI/O: routed to  --> incoming msg\n')
                      if(err) {
                        console.log('socket events err - 21: ',err);
                      }
                      //If Channel does not exist yet and entering supervisor
                      if (!chan &&  msg.msg == 'kipsupervisor') {
                         // console.log(1)
                         if (!msg.thread.ticket || !msg.thread.ticket.id || !msg.thread.ticket.isOpen){
                             msg.thread.ticket = {}
                             msg.thread.ticket.id = shortid.generate();
                             msg.thread.ticket.isOpen = true
                         }
                        socket.broadcast.emit('new bc message', msg)
                      }
                      //If Channel exists and entering supervisor
                      else if (chan && chan.resolved && msg.msg == 'kipsupervisor') {
                        // console.log(2)
                        chan.resolved = false;
                        chan.save(function(err, saved){
                            if(err) {
                                console.log('socket events err - 38: ',err);
                              }
                            if (!msg.thread.ticket || !msg.thread.ticket.id || !msg.thread.ticket.isOpen){
                                 msg.thread.ticket = {}
                                 msg.thread.ticket.id = shortid.generate();
                                 msg.thread.ticket.isOpen = true
                             }
                            socket.broadcast.emit('new bc message', msg)
                        })
                      }
                      //If channel exists and is not resolved
                      else if (chan){
                        // console.log(3,chan)
                        socket.broadcast.emit('new bc message', msg)
                      }
                      //Otherwise take no action. 
                      else {
                        if (msg.msg) {
                          console.log(msg.msg)
                        }
                      }
                    break;
                case 'outgoing':
                    console.log('I/O: routed to --> outgoing msg\n')
                    if (msg.bucket === 'response') {console.log('Broadcasting new bc message.'); socket.broadcast.emit('new bc message', msg) }
                    else { console.log('Emitting new bc message'); socket.emit('new bc message', msg) }
                    if(!(msg.flags && msg.flags.toTrain)) {
                      console.log('Sending results to client.', msg.flags,msg.client_res)
                      ioClient.emit("msgFromSever", msg);
                    } else {
                      console.log('Sending results to DB.', msg.flags,msg.client_res)
                    } 
                    break;
                case 'searchResults':
                    // console.log('I/O: routed to --> incoming results',msg,'\n')
                    socket.broadcast.emit('results', msg)
                    break;
                default:
                   if (chan && !chan.resolved) {
                     // console.log(5,msg.msg)
                     socket.broadcast.emit('new bc message', msg)
                   }
            }
          })
        });
        socket.on('new channel', function(channel) { 
                         // console.log('RECEIVED NEW CHANNEL', channel)
            if (!channel.resolved) {
                socket.broadcast.emit('new channel', channel)
            }
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
