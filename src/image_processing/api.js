var request = require('request')
var config = require('../config')

var stitch = module.exports = function(imageUrls, callback) {
  request({
    method: 'POST',
    url: config.picstitch,
    json: true,
    body: imageUrls
  }, function(e, r, b) {
    if (e) {
      return callback(e);
    } else {
      return callback(null, b);
    }
  })
}

if (!module.parent) {
  stitch([
    'https://gashaworld.files.wordpress.com/2012/01/squirtle_squad_vector_by_nomad19.png',
    'http://chavezcycling.com/wp-content/uploads/2009/06/mens-cycling-gloves.jpg',
    'http://i.ebayimg.com/images/i/250869332895-0-1/s-l1000.jpg'
  ], function(e, stitchedUrl) {
    if (e) {
      console.error(e);
    } else {
      console.log(stitchedUrl);
    }
  })
}
