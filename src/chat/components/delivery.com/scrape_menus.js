require('kip');
var co = require('co');
var request = require('request-promise')
var sleep = require('co-sleep');
var client_id = 'brewhacks2016';

co(function*() {
  kip.log('fuck yeah lets scrape those menus');
  var merchants = yield db.Merchants.find({}).select('id');
  for (var i = 0; i < merchants.length; i++) {
    kip.log(merchants[i]);
    var merchant_id = merchants[i].id;
    var data = yield request({url: `https://api.delivery.com/merchant/${merchant_id}/menu?client_id=${client_id}`, json: true});
    var menu = new db.Menu({
      merchant_id: merchant_id,
      raw_menu: data
    });
    yield menu.save();
    yield sleep(1000 + Math.random()*1000); // such sneak
  }
}).catch(kip.err);
