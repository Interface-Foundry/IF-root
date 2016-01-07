var request = require('request')
var should = require('should')
var config = require('config')
var nlp = require('./api')

        type: 'price',
        param: 'less' //or 'more'


var messages = [
  {
    m: 'cheapest 32" monitor with good reviews',
    r: {
      bucket: 'search',
      action: 'aggregate',
      tokens: ['cheapest 32" monitor with good reviews'],
      execute: [ //will fire commands in arr order
        { 
          bucket: 'search', //initial search
          action:'initial',
          val: '32" monitor'
        },
        { 
          bucket: 'search', //sorts cheapest
          action:'modify',
          dataModify: {
            type: 'price',
            param: 'less' //or 'more'
          }
        },
        {
          bucket: 'search', //sorts top reviews
          action:'modify',
          dataModify: {
            type: 'reviews',
            param: 'top' //or 'more'
          }
        }
      ]
    }
  },
  {
    m: '32" monitor with best reviews',
    r: {
      bucket: 'search', 
      action: 'aggregate',
      tokens: ['32" monitor with best reviews'],
      execute: [ //will fire commands in arr order
        { 
          bucket: 'search', //initial search
          action:'initial',
          val: '32" monitor'
        },
        {
          bucket: 'search', //sorts top reviews
          action:'sort',
          dataModify: {
            type: 'reviews',
            param: 'top' //or 'more'
          }
        }
      ]
    }
  },
  {
    m: 'best 32" monitor', 
    r: {
      bucket: 'search', 
      action: 'aggregate',
      tokens: ['best 32" monitor'],
      execute: [ //will fire commands in arr order
        { 
          bucket: 'search', //initial search
          action:'initial',
          val: '32" monitor'
        },
        { 
          bucket: 'search', //sorts cheapest
          action:'modify',
          dataModify: {
            type: 'price',
            param: 'less' //or 'more'
          }
        },
        {
          bucket: 'search', //sorts top reviews
          action:'modify',
          dataModify: {
            type: 'reviews',
            param: 'top' //or 'more'
          }
        }
      ]
    }
  },
  {
    m: 'cheapest 32" monitor',
    r: {
      bucket: 'search', 
      action: 'aggregate',
      tokens: ['cheapest 32" monitor'],
      execute: [ //will fire commands in arr order
        { 
          bucket: 'search', //initial search
          action:'initial',
          val: '32" monitor'
        },
        { 
          bucket: 'search', //sorts cheapest
          action:'modify',
          dataModify: {
            type: 'price',
            param: 'less' //or 'more'
          }
        }
      ]
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
        val: [ { hex: '#0000FF',
          name: 'Blue',
          rgb: [ 0, 0, 255 ],
          hsl: [ 170, 255, 127 ] },
        { hex: '#0000C8',
          name: 'Dark Blue',
          rgb: [ 0, 0, 200 ],
          hsl: [ 170, 255, 100 ] },
        { hex: '#0066FF',
          name: 'Blue Ribbon',
          rgb: [ 0, 102, 255 ],
          hsl: [ 153, 255, 127 ] },
        { hex: '#002FA7',
          name: 'International Klein Blue',
          rgb: [ 0, 47, 167 ],
          hsl: [ 158, 255, 83 ] } ]
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

  //* * * * review related queries * * * *//
  {
    m: '1 but best', 
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 but best'],
      dataModify: {
        type: 'reviews',
        param: 'top' //or 'more'
      }
    }
  },
  {
    m: '1 but best reviews', 
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 but best reviews'],
      dataModify: {
        type: 'reviews',
        param: 'top' //or 'more'
      }
    }
  },
  {
    m: '1 but good reviews', 
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 but good reviews'],
      dataModify: {
        type: 'reviews',
        param: 'top' //or 'more'
      }
    }
  },
  {
    m: '1 but cheapest and best', 
    r: {
      bucket: 'search',
      action: 'aggregate',
      tokens: ['1 but cheapest and best'],
      execute: [ //will fire commands in arr order
        { 
          bucket: 'search', //sorts cheapest
          action:'modify',
          searchSelect: [1],
          dataModify: {
            type: 'price',
            param: 'less' //or 'more'
          }
        },
        {
          bucket: 'search', //sorts cheapest
          action:'modify',
          searchSelect: [1],
          dataModify: {
            type: 'reviews',
            param: 'top' //or 'more'
          }
        }
      ]
    }
  },

  //* * * * price related * * * * //
  {
    m: '1 but less', //1 but cheaper
    r: {
      bucket: 'search',
      action: 'modify',
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
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 but cheaper'],
      dataModify: {
        type: 'price',
        param: 'less' //or 'more'
      }
    }
  },
  {
    m: '1 but cheapest', //1 but cheaper
    r: {
      bucket: 'search',
      action: 'modify',
      searchSelect: [1],
      tokens: ['1 but cheapest'],
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
      action: 'modify',
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
      tokens: ['more about 1']
    }
  },
  {
    m: 'more info about 1',
    r: {
      bucket: 'search',
      action: 'focus',
      searchSelect: [1],
      tokens: ['more info about 1']
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
