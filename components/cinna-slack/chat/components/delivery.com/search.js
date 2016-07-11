var request = require('request-promise');
var _ = require('lodash');
require('kip');

var defaultParams = {};

defaultParams.searchNearby = {
  pickup: false,
  addr: '',
  q: ''
};
module.exports.searchNearby = function* (params) {
  params = _.merge({}, defaultParams.searchNearby, params);
  console.log('searching delivery.com for restaurants with params', params);
  var allNearby = yield request({url: `https://api.delivery.com/merchant/search/delivery?client_id=brewhacks2016&address=${params.addr}`, json: true})
  debugger;
  return allNearby;
}


if (!module.parent) {
  // wow such test
  var co = require('co');
  co(function*() {
    var addr = '21 Essex St 10002';
    var results = yield module.exports.searchNearby({
      pickup: false,
      addr: addr
    });
    console.log(results);
  }).catch(kip.err);
}
