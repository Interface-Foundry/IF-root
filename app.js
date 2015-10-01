var express = require('express');
var app = express();
var config = require('config');

// load the app api at /styles
app.use('/styles', require('./IF_server'));

// redirect everything else to kipsearch.com
app.get('/*', function(req, res) {
  res.redirect('https://kipsearch.com');
})

// unhandled requests get 404'd
app.use(function(req, res) {
  res.status(404);
  res.send('404 - not found');
})

app.listen(config.app.port, function () {
    console.log("Illya casting magic on " + config.app.port + " ~ ~ ♡");
});
