// var ioClient = require('socket.io-client').connect("http://localhost:8000");
// var ioClient = require('socket.io-client').connect("http://54.173.166.189:8000"); //production
var ioClient = require('socket.io-client').connect("http://54.175.231.162:8000"); //yak
ioClient.on('connect', function() {
    console.log('\n\nConnected to cinna-slack client.\n\n')
})
var Channel = require('./server/models/Channel');
var Message = require('./server/models/Message');
var shortid = require('shortid');

exports = module.exports = function(io, cinnaio) {
    io.on('connection', function(socket) {
      socket.on('new message', function(msg) {
        Channel.findOne({id: msg.source.id}, function(err, chan) {
          Message.findOne({'source.id': msg.source.id, 'thread.ticket.isOpen': true}).sort({'_id':-1}).exec(function(err, latestMsg){
            msg.ts = new Date().toISOString();
            var type =  ((msg.flags && msg.flags.toSupervisor) || (typeof msg.msg == 'string' && msg.msg.trim() == 'kipsupervisor'))  ? 'incoming' :  ((msg.flags && (msg.flags.toCinna || msg.flags.toClient)) ? 'outgoing' : ((msg.flags && msg.flags.searchResults) ? 'searchResults' : null) )
              switch(type) {
                case 'incoming':
                    console.log('\nI/O: routed to  --> incoming msg\n')
                      if(err) {
                        console.log('socket events err - 21: ',err);
                      }
                      //If Channel does not exist yet and entering supervisor
                      if (!chan &&  typeof msg.msg == 'string' && msg.msg.trim() == 'kipsupervisor') {
                         console.log(1)
                         if (!msg.thread.ticket || !msg.thread.ticket.id || !msg.thread.ticket.isOpen){
                             msg.thread.ticket = {}
                             msg.thread.ticket.id = shortid.generate();
                             msg.thread.ticket.isOpen = true
                         }
                        socket.broadcast.emit('new bc message', msg)
                      }
                      //If Channel exists and entering supervisor
                      else if (chan && msg.msg == 'kipsupervisor') {
                        console.log(2)
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
                        // console.log(3)
                        // if (latestMsg) {
                        //   msg.thread = latestMsg.thread;
                        //   msg.thread.sequence = parseInt(msg.thread.sequence) + 1
                        //   console.log('sockEvents 54 should be hitting here: ',msg)
                        // }
                        socket.broadcast.emit('new bc message', msg)
                      }
                      //Otherwise take no action. 
                      else {
                        // console.log(4)
                        if (msg.msg) {
                          console.log(msg.msg)
                        }
                      }
                    break;
                case 'outgoing':
                    console.log('I/O: routed to --> outgoing msg\n')
                    if (msg.bucket === 'response') {
                      console.log('Sending text message to client.', msg); 
                      socket.broadcast.emit('new bc message', msg) }
                    else { 
                      // console.log('Emitting new bc message'); 
                      socket.emit('new bc message', msg) 
                    }

                    if(!(msg.flags && msg.flags.toTrain)) {
                      console.log('Sending results to client.', msg)
                      ioClient.emit("msgFromSever", msg);
                    } else {
                      console.log('Sending results to DB.')
                    } 
                    break;
                case 'searchResults':
                    console.log('I/O: routed to --> incoming results',msg.client_res,'\n')
                    socket.broadcast.emit('results', msg)
                    break;
                default:
                   if (chan && !chan.resolved) {
                     socket.broadcast.emit('new bc message', msg)
                   } else {
                     console.log(5,msg.msg)
                   } 
            }
          }) // end of Message.findOne
         })//end of Channel.findOne
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
