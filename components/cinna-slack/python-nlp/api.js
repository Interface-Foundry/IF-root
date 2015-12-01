var request = require('request')
var config = require('config')

var parse = module.exports.parse = function(text, callback) {
  request({
    method: 'POST',
    url: 'http://localhost:5000/parse',
    json: true,
    body: {
      text: text
    }
  }, function(e, r, b) {
    if (e) {
      return callback(e);
    } else {
      return callback(null, b);
    }
  })
}

if (!module.parent) {
  var sentences = [
    'like the frist one but not so derpy',
    'kip find me running leggings',
    'like the first one but orange',
    'does the first one have pockets?',
    'yes please',
    'do you have B but in blue',
    'please show brighter blue i don\'t like dark colour',
    'hmm I really like C what\'s the fabric?',
    'ok pls buy for me thanks',
    'looking for a black zara jacket',
    'I like the thrid one',
    'is there any size medium?'
  ];
  sentences.map(function(a) {
    parse(a, function(e, res) {
      if (e) {
        console.error(e);
      } else {
        console.log(res);
      }
    })
  })
}
