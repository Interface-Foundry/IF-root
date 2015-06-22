var request = require('request');
var pythonEndpoint = 'http://localhost:9998/';
request = request.defaults({
  baseUrl: pythonEndpoint,
  json: true
});

/**
 * This module wraps a python http api for neighboord name finding given lat lon
 * @type {{}}
 */
module.exports = {
  /**
   * For a given S3 url, this will call back with an object containing a list of items
   * in the picture
   * @param url unescaped S3 url
   * @param callback function(err, data) where data wil be {items: [{center: [x,y]}]}
   */
  findArea: function(lat, lon, callback) {
    request('findArea?lat=' + encodeURIComponent(lat) + '&lon='+ encodeURIComponent(lon), function(e, r, body) {
      if (e) {callback(e)}
      callback(null, body);
    });
  }
};