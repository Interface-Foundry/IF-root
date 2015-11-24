var request = require('request')
require('colors')

var PRINT_SUCCESS = true;

var messages = [
  {
    m: 'skinny black jeans',
    r: {
      tokens: ['skinny black jeans']
    }
  },
  {
    m: 'Levi skinny black jeans New York',
    r: {
      tokens: ['skinny black jeans'],
      location: 'New York',
      brand: 'Levi'
    }
  }
];


// run the module reloader
request({
  url: 'http://localhost:8083/reload'
})

// test the messages
messages.map(function(o) {
  request({
    url: 'http://localhost:8083/parse',
    method: 'POST',
    json: true,
    body: {
      text: o.m
    }
  }, function(e, r, b) {
    console.log(b)
    console.log(b.ss)

  })
})
