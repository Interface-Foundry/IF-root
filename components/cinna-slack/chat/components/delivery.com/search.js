var _ = require('lodash');
var co = require('co');

require('kip');
var api = require('./api-wrapper');

var defaultParams = {};


//
// Search for coool restaurant shit
//
defaultParams.search = {
  skip: 0,
  addr: '',
  q: '',
  pickup: false
}
module.exports.search = function*(params) {
  params = _.merge({}, defaultParams.search, params);
  console.log('food search with params', params);
  var all_results = yield api.searchNearby(params);
  // todo do something smart here
  var shown_results = all_results.merchants.slice(0, 3); // top three
  debugger;
  // log shit
  db.Metrics.log('food.search', {
    params: params,
    address: all_results.search_address,
    total_results: all_results.merchants.length,
    shown_results: shown_results,
  });

  // return just the good stuff
  return {
    address: niceAddress(all_results.search_address),
    results: shown_results
  };
}

defaultParams.menuSearch = {
  skip: 0,
  menu: [],
  q: ''
}
module.exports.menuSearch = function*(params) {
  params = _.merge({}, defaultParams.menuSearch, params);
  // um somehow find the best matching menu items... somehow.
  // first lets return the firt three items.
  var items = getMenuItems(params.menu).slice(0, 3);
  return items;
}

function getMenuItems(menu) {
  var items = [];
  menu.map(m => {
    if (m.type === 'item') {
      items.push(m);
    } else if (m.type === 'menu') {
      items = items.concat(getMenuItems(m.children));
    } else {
      console.log('unhandled item type', m.type);
    }
  });
  return items;
}

function niceAddress(search_address) {
  return `${search_address.street} ${search_address.city}, ${search_address.state} ${search_address.postal_code}`;
}


if (!module.parent) {
  console.log('')
  console.log('Oh how quaint, paying for food today like a peasant?\nNo in-office chef?\nMaybe you should work for a real unicorn.'.green);
  co(function*() {
    var menu = yield db.Menus.findOne({});
    var items = getMenuItems(menu.raw_menu.menu);
    console.log(items); 
    return;
    var results = yield module.exports.search({
      addr: '21 Essex St 10002'
    });
    results.map(r => {
      console.log(r);
    })
  }).catch(kip.err);
}
