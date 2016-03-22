// var ioClient = require('socket.io-client').connect("http://localhost:5100");
var ioClient = require('socket.io-client').connect("http://52.90.122.209:5100");
var newParentItem = require('./history.js').newParentItem
var newChildItem = require('./history.js').newChildItem
var recallHistory = require('./history.js').recallHistory
var shortid = require('shortid');

ioClient.on('connect', function() {
  console.log('Connected to support client.')
})

//flag to determine is emitting 'new message' event or both 'new message' and 'new channel'
function emit(data, newmessage) {
  if (!ioClient.connected) {
    ioClient.on('connect', function() {
      if (newmessage) {
            emitBoth(data)
      } else {
        emitMsg(data)
      }
    })
  } else {
        if (newmessage) {
         emitBoth(data) 
      } else {
        emitMsg(data)
      }
  }
}
//Used for banter or returning result set to supervisor
function emitMsg(data) {
 // console.log('\n\n\nEmitting message\n\n\n')
 ioClient.emit('new message', data)
}

//This function is used for new messages/channels
function emitBoth(data) {
  //Prevent the dreaded infinite loop
  if (data.flags && data.flags !== {} && data.flags.toCinna) return
  var resolved = (data.msg === 'kipsupervisor') ? false : true
  if (data.msg && (data.msg.trim() === 'kipsupervisor') && data.thread && data.thread.ticket) {
    data.thread.ticket.isOpen = true
   } else if (data.msg && (data.msg.trim() === 'kipsupervisor') && !data.thread.ticket) {
     data.thread.ticket = {}
     data.thread.ticket.id = shortid.generate();
     data.thread.ticket.isOpen = true
   }
  ioClient.emit('new channel', {
    name: data.source.channel,
    id: data.source.id,
    resolved: resolved
  })
  var action = data.action ? data.action : '';
  var flags = (data.flags && data.flags !== {}) ? data.flags : {toSupervisor: true};

  ioClient.emit('new message', {
    id: null,
    incoming: true,
    msg: (data.msg ? data.msg : ''),
    tokens: ((data.msg && typeof data.msg == 'string') ? data.msg.split() : []),
    bucket: data.bucket,
    action: action,
    amazon: [],
    source: {
      //chnge to data.source.origin
      origin: data.source.origin,
      channel: data.source.channel,
      org: data.source.id.split('_')[0],
      id: data.source.id
    },
    client_res: [],
    ts: Date.now,
    thread: data.thread,
    urlShorten:data.urlShorten,
    thread: data.thread,
    flags: flags
  })
}

module.exports.emit = emit