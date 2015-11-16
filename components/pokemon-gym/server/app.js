var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')

app.use(bodyParser.json());
app.use(morgan())

app.get('/status', function(req, res) {
  res.send([{host: 'example'}])
})

app.post('/query', function(req, res) {
  res.send({
    elasticsearchQuery: {deep: {nested: {query: 'example'}}},
    results: [{
      elasticsearchDoc: {text: 'example'},
      mongoDoc: {id: 'example', description: 'example'}
    }]
  })
})

app.get('/errors/node', function(req, res) {
  res.send([{
    message: 'example',
    stack: 'example'
  }])
})

app.get('/errors/front-end', function(req, res) {
  res.send([{
    message: 'example',
    stack: 'example'
  }])
})

app.get('/errors/processing', function(req, res) {
  res.send([{
    message: 'example',
    stack: 'example'
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
