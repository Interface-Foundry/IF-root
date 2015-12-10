var request = require('request')
var should = require('should')
var config = require('config')
var nlp = require('./api')

var messages = [
  {
    m: 'skinny black jeans',
    r: {
      action: 'initial',
      bucket: 'search',
      tokens: ['skinny black jeans']
    }
  },
  {
    m: 'more',
    r: {
      bucket: 'search',
      action: 'more',
      tokens: ['more']
    }
  },
  {
    m: 'more like 1',
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1],
      tokens: ['more like 1']
    }
  },
  {
    m: 'more like 1 and 3',
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1,3],
      tokens: ['more like 1 and 3']
    }
  },
  {
    m: '1 in blue',
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 in blue'],
      dataModify: {
        type: 'color',
        val: ['blue'] // TODO similar colors ,'navy','aqua'] //start with root color, include any additional synonyms
      }
    }
  },
  {
    m: '1 in wool',
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 in wool'],
      dataModify: {
        type: 'material',
        val: ['wool']// TODO,'cashmere','merino'] //start with root, include any additional synonyms
      }
    }
  },
  {
    m: '1 in XL',
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 in XL'],
      dataModify: {
        type: 'size',
        val: ['xl']//, 'extra large','XL'] //start with spelled out size, then add acronyms (better for amazon)
      }
    }
  },
  {
    m: '1 with collar',
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 with collar'],
      dataModify: {
        type: 'genericDetail', //default for modifiers we dont know how to handle
        val: ['collar']
      }
    }
  },
  {
    m: '1 by Zara',
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 by Zara'],
      dataModify: {
        type: 'brand',
        val: ['zara']
      }
    }
  },
  {
    m: '1 but less', //1 but cheaper
    skip: true,
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1],
      tokens: ['1 but less'],
      dataModify: {
        type: 'price',
        param: 'less' //or 'more'
      }
    }
  },
  {
    m: '1 but cheaper', //1 but cheaper
    skip: true,
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1],
      tokens: ['1 but less'],
      dataModify: {
        type: 'price',
        param: 'less' //or 'more'
      }
    }
  },
  {
    m: '1 but less than $25',
    skip: true,
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1],
      tokens: ['1 but less than $25'],
      dataModify: {
        type: 'price',
        param: 'less than', //or 'more than'
        val: [25] //in USD
      }
    }
  },
  {
    m: 'info 1',
    r: {
      bucket: 'search',
      action: 'focus',
      searchSelect: [1],
      tokens: ['info 1']
    }
  },
  {
    m: '1',
    r: {
      bucket: 'search',
      action: 'focus',
      searchSelect: [1],
      tokens: ['1']
    }
  },
  {
    m: 'more about 1',
    r: {
      bucket: 'search',
      action: 'focus',
      searchSelect: [1],
      tokens: ['info 1']
    }
  },
  {
    m: 'more about 1',
    skip: true,
    r: {
      bucket: 'search',
      action: 'similar',
      searchSelect: [1],
      tokens: ['info 1']
    }
  },
  {
    m: 'save 1',
    r: {
      action: 'save',
      bucket: 'purchase',
      searchSelect: [1],
      tokens: ['save 1']
    }
  },
  {
    m: 'get',
    r: {
      action: 'checkout',
      bucket: 'purchase',
      tokens: ['get']
    }
  },
  {
    m: 'checkout',
    r: {
      action: 'checkout',
      bucket: 'purchase',
      tokens: ['checkout']
    }
  },
  {
    m: 'get 1',
    r: {
      action: 'checkout',
      bucket: 'purchase',
      searchSelect: [1], //checks out without view cart or product info//
      tokens: ['get 1']
    }
  },
  {
    m: 'checkout 1',
    r: {
      action: 'checkout',
      bucket: 'purchase',
      searchSelect: [1], //checks out without view cart or product info//
      tokens: ['checkout 1'],
    }
  },
  {
    m: 'remove 1',
    r: {
      action: 'remove',
      bucket: 'purchase',
      searchSelect: [1], //can be any array of numbers
      tokens: ['remove 1']
    }
  },
  {
    m: 'view cart',
    r: {
      action: 'list',
      bucket: 'purchase',
      tokens: ['view cart']
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
    if (o.skip) {
      return console.log('skipping', o.m);
    }
    it(o.m, function(done) {
      nlp.parse(o.m, function(e, r) {
        r.should.deepEqual(o.r);
        done();
      })
    })
  })
})
