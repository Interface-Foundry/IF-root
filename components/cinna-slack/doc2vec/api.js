var request = require('request');
var kip = require('kip')

/* get embeddings for one or more sentences.

handles both strings and arrays of strings

doc2vec('this is a sentence', function(err, embedding) {})
doc2vec(['lots of sentences', ...], function(err, embeddings) {})

*/
module.exports = function(text, callback)) {
  if (typeof text === 'string') {
    getOne(text, callback);
  } else if (text instanceof Array) {
    getMany(text, callback);
  }
}

function getOne = function(s, callback) {
  request({
    method: 'POST',
    url: config.doc2vec + '/embedone',
    json: true,
    body: {
      text: s
    }
  }, function(e, r, b) {
    if (kiperr(e)) { return callback(e) }
    callback(null, b);
  })
}

function getMany = function(s, callback) {
  request({
    method: 'POST',
    url: config.doc2vec + '/embedmany',
    json: true,
    body: {
      text: s
    }
  }, function(e, r, b) {
    if (kiperr(e)) { return callback(e) }
    callback(null, b);
  })
}
