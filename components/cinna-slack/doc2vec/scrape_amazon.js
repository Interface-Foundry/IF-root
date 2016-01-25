var amazonHTML = require('../chat/components/amazonHTML');
var kip = require('kip')
var db = require('db')

function scrape (url, cb) {

  amazonHTML.basic(url, function(e, product) {
    if (kip.err(e) || !product) {
      kip.err('no product for url ' + url);
      return cb(e || 'no product for url');
    }

    amazonHTML.qa(url, function(e, qa) {
      if (qa) {
        product.answeredQuestions = qa;
      }
      db.Products.save(page)
      if (kip.err(e)) {
        cb(e)
      }
    })
  })
}
