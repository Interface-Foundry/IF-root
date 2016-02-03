var ioClient = require('socket.io-client').connect("http://localhost:3000");
ioClient.on('connect', function() {
  console.log('Connected to support client.')
})

//flag to determine is emitting 'new message' event or both 'new message' and 'new channel'
function emit(data, newmessage) {
  if (!ioClient.connected) {
    ioClient.on('connect', function() {
      if (newmessage) {
      //    if (data.bucket === 'results') {
      //       console.log('supervisor.js --> 12',data)
            emitBoth(data)
         // } else {
         //    emitBoth(data) 
         // }
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
 console.log('emitting message', data)
 ioClient.emit('new message', data)
}

//This function is used for new messages/channels
function emitBoth(data) {
  //Prevent the dreaded infinite loop
  if (data.flags && data.flags.toCinna) return
  
  console.log('emitting both', data)
  
  var resolved = (data.bucket === 'supervisor') ? false : true
  ioClient.emit('new channel', {
    name: data.source.channel,
    id: data.source.id,
    resolved: resolved
  })
  var action = data.action ? data.action : ''
  var flags = data.flags ? data.flags : {toSupervisor: true};
  //Resolved = false only if this is a supervisor flagged message
  var resolved = (data.bucket === 'supervisor') ? false : true
  ioClient.emit('new message', {
    id: null,
    incoming: true,
    msg: data.msg,
    tokens: [data.msg.split()],
    bucket: data.bucket,
    action: action,
    amazon: [],
    // dataModify: {
    //     type: '',
    //     val: [],
    //     param: ''
    // },
    source: {
      origin: 'socket.io',
      channel: data.source.channel,
      org: 'kip',
      id: data.source.id
    },
    client_res: [],
    ts: Date.now,
    resolved: resolved,
    parent: false,
    flags: flags
  })
}

module.exports.emit = emit