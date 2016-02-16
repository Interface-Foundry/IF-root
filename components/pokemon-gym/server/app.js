var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var config = require('config')
var request = require('request')
var auth = require('basic-auth-connect')

var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Message = db.Message;

app.use(bodyParser.json());
app.use(morgan())


app.use(auth('kip', 'vampirecat1200'))
app.use(express.static(__dirname + '/../UI/material/client'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

//the auth is username: kip, password: vampirecat1200
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

app.get('/vc/timexsearch', function(req, res) {

  Message.find({}).sort({'_id': -1}).limit(10).exec(function(err, msg) {  
    if(err){
        console.log('Error: Cannot find initial search for recallHistory');
    }   
    else {

      res.send(msg);
        //console.log('db ',msg);
    }
  });
  // check_server.list(servers, function(e, stats) {
  //   if(e) {
  //     res.status(500);
  //     res.send(e);
  //   } else {
  //     res.send(stats);
  //   }
  // })

})

//
// Query testing
//
var search = require('../../IF_search/newsearch')
var searchterms = require('../../IF_search/searchterms');
app.post('/query', function(req, res) {
  var q = search.getQuery(req.body, 0)
  var terms = searchterms.parse(req.body.text);
  request({
    method: 'POST',
    url: 'https://kipapp.co/styles/api/items/search',
    body: req.body,
    json: true
  }, function(e, r, b) {
    if (e) {
      console.error('error', e);
    }

    res.send({
      fashionTerms: terms,
      elasticsearchQuery: q,
      results: r.body.results.map(function(r) {
        return {
          mongoDoc: r
        }
      })
    })
  })
})

//
// Error monitoring
//
var elasticsearch = require('elasticsearch')
// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
    var defaultLogger = function() {};

    this.error = defaultLogger;
    this.warning = defaultLogger;
    this.info = defaultLogger;
    this.debug = defaultLogger;
    this.trace = defaultLogger;
    this.close = defaultLogger;
};
var es = new elasticsearch.Client({
    host: config.elasticsearchElk.url,
    log: ESLogger
});
console.log('elasticserach on', config.elasticsearchElk.url)
app.get('/errors/node', function(req, res) {
  var query = {
    index: 'logstash-node',
    type: 'app.js',
    body: {
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
  var query = {
    index: 'logstash-node',
    type: 'kippsearch.com',
    body: {
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
