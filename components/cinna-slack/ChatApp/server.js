var http = require('http');
var fs = require('fs');

var createServerSnippet =  function(req, res) {
  fs.readFile("index.html", function(err, data ) {
      res.end(data);
  }) ;
}

var app = http.createServer(createServerSnippet).listen(8000);
console.log("listening localhost:8000");

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    console.log("socket connected");

    socket.on("msgToClient", function(data) {
    	//data.msg <<<--- incoming message
    	var msg;
    	if (data.msg == 'pic'){
    		msg = 'http://www.thinkgeek.com/images/products/zoom/f044_portal2_aperture_test_subject_hat.jpg';
    	}
    	else if (data.msg == 'url'){
    		msg = 'https://kipsearch.com';
    	}
    	else {
    		msg = 'you sent '+data.msg;
    	}

        io.sockets.emit("msgFromSever", {message: msg})
    })
});

