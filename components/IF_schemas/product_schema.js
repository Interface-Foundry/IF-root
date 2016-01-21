var mongoose = require('mongoose');

/**
 * Log activity for activity feeds
 */
var product = mongoose.Schema({
  full_html: String,

  description: String,

  price: String,

  answeredQuestions: [{
    q: String,
    a: [String]
  }]
});


var Product = mongoose.model('Product', product);

module.exports = Product;
