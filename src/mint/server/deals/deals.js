var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * Returns the most recent deals in the database
 * @param count {integer} number of deals to return (defaults to 10)
 * @param skip {int} number of deals to skip when paging (defaults to 0)
 */
var getDeals = function * (count, skip) {
  yield dbReady;
  if (!count) count = 10;
  if (!skip) skip = 0;

  var query = {
    limit: count,
    sort: 'createdAt DESC',
    skip: skip,
    where: {
      active: true
    }
  }

  var camels = yield db.CamelItems.find(query);

  return yield camels;
};

module.exports = {
  getDeals: getDeals
};

if (!module.parent) {
  const co = require('co')
  const fs = require('mz/fs')
  co(function * () {
    var deals = yield getDeals(5, 1)
    console.log(deals)
    yield fs.writeFile('deals.json', JSON.stringify(deals))
    process.exit(0)
  })
}
