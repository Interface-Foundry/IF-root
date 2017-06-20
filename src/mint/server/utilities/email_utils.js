var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var utils = {}

/**
 * abstracting logic reformatting cart items to display properly on Koh's latest emails
 * returns [items, users]
 */
utils.formatItems = async function (cartItems) {
  //organize items according to which user added them
  var userItems = {};
  var items= []
  var users = []
  cartItems.map(function (item) {
    if (!userItems[item.added_by]) userItems[item.added_by] = [];
    userItems[item.added_by].push(item);
  });
  //and turn that from an object to a 2-D array
  //and also construct an array of users congruent w/ the adding users of objects
  for (var k in userItems) {
    var addingUser = await db.UserAccounts.findOne({id: k});
    items.push(userItems[k]);
    users.push(addingUser)
  }
  return [items, users]
}

module.exports = utils
