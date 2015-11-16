var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')

app.use(bodyParser.json());
app.use(morgan())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

//
// Server status monitoring
//
var check_server = require('../status/check_server')
var servers = [
  'pikachu.internal.kipapp.co',
  'flareon.internal.kipapp.co',
  'vaporeon.internal.kipapp.co',
  'jankeon.internal.kipapp.co'
]
app.get('/status', function(req, res) {
  check_server.list(servers, function(e, stats) {
    if(e) {
      res.status(500);
      res.send(e);
    } else {
      res.send(stats);
    }
  })
})

//
// Query testing
//
app.post('/query', function(req, res) {
  res.send({
    elasticsearchQuery: {deep: {nested: {query: 'example'}}},
    results: [{
      elasticsearchDoc: {text: 'example'},
      mongoDoc: {id: 'example', description: 'example'}
    }]
  })
})

//
// Error monitoring
//
app.get('/errors/node', function(req, res) {
  res.send([{
    "@timestamp": (new Date()).toISOString(),
    message: 'example ERROR: type error',
    stack: 'example at line 33:12',
    niceMessage: 'example nice message \\(^ヮ^)/',
    devMessage: 'example dev message, like "TODO was no time to handle multiple shopify stores"'
  }])
})

app.get('/errors/front-end', function(req, res) {
  res.send([{
    "@timestamp": (new Date()).toISOString(),
    message: 'example ERROR: type error',
    stack: 'example at line 33:12',
    niceMessage: 'example nice message \\(^ヮ^)/',
    devMessage: 'example dev message, like "TODO was no time to handle multiple shopify stores"'
  }])
})

app.get('/errors/processing', function(req, res) {
  res.send([{
    "@timestamp": (new Date()).toISOString(),
    message: 'example ERROR: type error',
    stack: 'example at line 33:12',
    niceMessage: 'example nice message \\(^ヮ^)/',
    devMessage: 'example dev message, like "TODO was no time to handle multiple shopify stores"'
  }])
})

var port = 9999;
app.listen(port, function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('🏆 pokemon gym back end listening on port ' + port + ' 🏆')
  }
})
