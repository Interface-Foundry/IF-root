var express = require('express');
var app = express();
var fs = require('fs');
var server = require('https').createServer({pfx: fs.readFileSync(__dirname + '/key.pfx')}, app);
server.listen(443);
app.get('/', (req, res) => { res.send('woooooo'); });
