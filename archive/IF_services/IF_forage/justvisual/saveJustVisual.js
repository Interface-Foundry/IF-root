var db = require('db');
var kipScrapeTools = require('../kipScrapeTools');
var Promise = require("bluebird");
require('vvv');

module.exports = function(image) {
  // first i'll just save it as-is
  // next we'll scrape the source url for the item as well.
  image._id = image.id;
  delete image.id;
  return new Promise(function(resolve, reject) {
    db.JustVisual.findById(image._id, function(e, i) {
      if (e) {
        console.error('error finding justvisual image')
        console.error(e);
        return reject(e);
      }
      if (i) {
        log.v('found justvisual image', image._id)
        return resolve();
      }

      log.v('making new justvisual image', image._id)
      image = new db.JustVisual(image);
      image.save(function(e, i) {
        if (e) {
          console.error('error saving justvisual image')
          console.error(e);
          reject(e)
        } else {
          log.v('saved justvisual image', i)
          resolve();
        }
      })
    })
  })
}
