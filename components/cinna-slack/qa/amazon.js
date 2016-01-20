var amazonHTML = require('../chat/components/amazonHTML')
var kip = require('kip')

// ask a question about a product
module.exports = function(question, url, callback) {
  amazonHTML.basic(url, function(err, product) {
    if (kip.err(err)) { return callback(err) }


  })
}
