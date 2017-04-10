var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * Returns the most recent deals in the database
 * @param count {integer} number of deals to return (defaults to 10)
 * @param skip {int} number of deals to skip when paging (defaults to 0)
 */
var getDeals = function * (count, skip) {
  console.log('get deals called')
  yield dbReady;
  if (!count) count = 10;

  var query = {
    limit: count,
    sort: 'createdAt DESC',
    where: {
      active: true
    }
  }

  if (skip) query.skip = skip;

  var camels = yield db.CamelItems.find(query);
  console.log('just got camels');

  //if there's something wrong with the value passed in, just start from the beginning
  if (!camels.length && lastPosition > -1) return yield getDeals();
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
