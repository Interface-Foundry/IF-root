var request = require('request');

/**
 * browser.js is just request.js with some defaults set
 */

var j = request.jar();

module.exports = request.defaults({
  jar: j,
  baseUrl: 'http://localhost:2997/',
  json: true
});
