var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var config = require('config')

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
  'jankeon.internal.kipapp.co',
  'charmander.internal.kipapp.co',
  'elasticsearch-cerulean.internal.kipapp.co',
  'elasticsearch-vermillion.internal.kipapp.co'
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
var elasticsearch = require('elasticsearch')
var es = elasticsearch.Client({
  host: config.elasticsearchElk.url
})
console.log('elasticserach on', config.elasticsearchElk.url)
app.get('/errors/node', function(req, res) {
  var query = {
    body: {
      index: 'logstash-node',
      size: 20,
      sort: [{
        "@timestamp": {
          order: 'desc'
        }
      }],
      query: {
        match_all: {}
      }
    }
  }

  es.search(query).then(function(results) {
    res.send(results.hits.hits.map(function(doc) {
      return doc._source;
    }));
  });
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
