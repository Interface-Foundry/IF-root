var request = require('request');
var kip = require('kip')
var config = require('config')
var debug = require('debug')('nlp')

/* get embeddings for one or more sentences.

handles both strings and arrays of strings

doc2vec('this is a sentence', function(err, embedding) {})
doc2vec(['lots of sentences', ...], function(err, embeddings) {})

*/
module.exports = function(text, callback) {
  if (typeof text === 'string') {
    getOne(text, callback);
  } else if (text instanceof Array) {
    getMany(text, callback);
  }
}

function getOne (s, callback) {
  request({
    method: 'POST',
    url: config.doc2vec + '/embedone',
    json: true,
    body: {
      text: s
    }
  }, function(e, r, b) {
    if (kip.err(e)) { return callback(e) }
    callback(null, b);
  })
}

function getMany (s, callback) {
  request({
    method: 'POST',
    url: config.doc2vec + '/embedmany',
    json: true,
    body: {
      text: s
    }
  }, function(e, r, b) {
    if (kip.err(e)) { return callback(e) }
    callback(null, b);
  })
}

if (!module.parent) {
  var sentences = [
    'did sid chamberlain explode'
    // 'i would like to buy a hamburger',
    // 'please help me locate the sheep',
    // 'can you help me find the sheep',
    // 'where are the sheep?',
    // 'where are the lambs?',
    // 'does it come in size medium?',
    // 'does it run big or small?'
  ]

  function run(i) {
    console.log(sentences[i])
    module.exports(sentences[i], function(err, embedding) {
      kip.fatal(err);
      console.log(embedding)
      if (sentences[++i]) {
        run(i);
      }
    })
  }

  run(0);
}
