var request = require('request')
var should = require('should')
var config = require('config')
var nlp = require('./api')

var messages = [
  {
    m: 'more like 1',
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1]
    }
  },
  {
    m: 'more like 2',
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [2]
    }
  },
  {
    m: 'skinny black jeans',
    r: {
      action: 'initial',
      bucket: 'search',
      tokens: ['skinny black jeans']
    }
  },
  {
    m: 'Levi skinny black jeans New York',
    r: {
      tokens: ['skinny black jeans'],
      location: 'New York',
    }
  }
];


// run the module reloader
request({
  url: config.nlp + '/reload'
})

// test the messages
describe('test messages on ' + config.nlp, function() {
  messages.map(function(o) {
    it(o.m, function(done) {
      nlp.parse(o.m, function(e, r) {
        r.should.deepEqual(o.r);
        done();
      })
    })
  })
})
