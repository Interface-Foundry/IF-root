var rp = require('request-promise');

var popoutUrl = 'http://6945acc9.ngrok.io/cafe';

var utils = {};

utils.getUrl = function (rest_id, team_id, delivery_ObjectId, user_id) {
  return rp({
    url: popoutUrl,
    method: 'POST',
    json: {
      rest_id: rest_id,
      team_id: team_id,
      delivery_ObjectId: delivery_ObjectId,
      user_id: user_id
    }
  })
  .then(function (res) {
    return res;
  })
  .catch(function (err) {
    kip.debug('ERROR', err)
  })
  return url;
}

module.exports = utils;
