var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

/**
 * Returns the most recent deals in the database
 * @param count {integer} number of deals to return
 * @param lastPosition {string} rank of the last deal we've shown the viewer (and therefore don't want to show again)
 */
var getDeals = function * (count, lastPosition) {
  console.log('todays deals called');
  yield dbReady;
  console.log('db ready');
  if (!lastPosition) lastPosition = -1;

  var query = {
    limit: count,
    sort: 'position',
    where: {
      active: true,
      position: {
        '>': lastPosition
      }
    }
  };

  console.log('about to query for camels');
  var camels = yield db.CamelItems.find(query);

  //if there's something wrong with the value passed in, just start from the beginning
  if (!camels.length && lastPosition > -1) return yield getDeals();

  console.log('got the camels');
  // console.log('this many', camels.length);
  camels.map(c => console.log(c.category));
  return yield camels;
};

module.exports = {getDeals: getDeals};
