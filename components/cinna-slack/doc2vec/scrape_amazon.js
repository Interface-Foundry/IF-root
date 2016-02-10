var amazonHTML = require('../chat/components/amazonHTML')
var kip = require('kip')
var db = require('./trainingDB');

function scrape (url, cb) {

  amazonHTML.basic(url, function(e, product) {
    if (kip.err(e) || !product) {
      kip.err('no product for url ' + url);
      return cb(e || 'no product for url');
    }
    console.log('got product ' + product.asin + ' ')
    db.insertProduct(product);

    // returns [{q: String, a: [String]}]
    amazonHTML.qa(product.asin, function(e, questions) {
      console.log('got QA for ' + product.asin);
      if (kip.err(e)) {
        cb(e)
      }

      questions = questions || [];
      questions.map(function(q) {
        q.a.map(function(a) {
          db.insertQA({
            asin: product.asin,
            q: q.q,
            a: a
          })
        })
      })
      cb()
    })
  })
}

var fs = require('fs');

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
Array.prototype.shuffle = function() { return shuffle(this); }

var ASINS = fs.readFileSync('./asins.txt', 'utf8').split('\n').shuffle();
//ASINS = ['B00VVOCSOU', 'B00F23LOJQ'];

var i = 0;
setInterval(function() {
  scrape('http://www.amazon.com/gp/product/' + ASINS[i++] + '/', function(e) {
    console.error(e);
  })
}, 3 * 1000)
