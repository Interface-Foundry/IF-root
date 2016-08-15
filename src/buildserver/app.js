var express = require('express')

require('kip');


var app = express();
app.use(express.static(__dirname + '/public'));

app.listen(8000);
kip.log('buildserver listening on port 8000')