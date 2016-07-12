var request = require('request-promise');
var _ = require('lodash');
var co = require('co');
require('kip');

var client_id = 'brewhacks2016';

var defaultParams = {};

defaultParams.searchNearby = {
  pickup: false,
  addr: ''
};
module.exports.searchNearby = function* (params) {
  params = _.merge({}, defaultParams.searchNearby, params);
  console.log('searching delivery.com for restaurants with params', params);
  var allNearby = yield request({url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`, json: true})
  
  // make sure we have all the merchants in the db
  saveMerchants(allNearby.merchants);
  return allNearby;
}

var definitelyExistingMerchants = [];
function saveMerchants(merchants) {
  co(function*() {
    for (var i = 0; i < merchants.length; i++) {
      if (definitelyExistingMerchants.indexOf(merchants[i].id) >= 0) {
        continue;
      }
      var m = yield db.Merchants.findOne({
        id: merchants[i].id
      }).select('id').exec();
      if (!m) {
        console.log('saving new merchant', merchants[i].summary.name);
        m = new db.Merchant({
          id: merchants[i].id,
          data: merchants[i]
        });
        yield m.save();
        console.log('saved');
        definitelyExistingMerchants.push(m.id);
      }
    }
  }).catch(kip.err);
}


module.exports.getMenu = function* (merchant_id) {

}


if (!module.parent) {
  // wow such test
  co(function*() {
    var addr = '21 Essex St 10002';
    var results = yield module.exports.searchNearby({
      pickup: false,
      addr: addr
    });
    console.log(results.length);
  }).catch(kip.err);
}
