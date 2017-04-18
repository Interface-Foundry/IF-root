var user = 'ba4b2000-5c7e-4eed-82a5-a04312630493'
var co = require('co')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

co(function * () {
  yield dbReady

  var userIds = [user]

  // find all the cart ids for which the user is a member
  const memberCarts = yield db.carts_members__user_accounts_id.find({
    user_accounts_id: {
      $in: userIds
    }
  })

  const memberCartsIds = memberCarts.map( c => c.carts_members )

  // find all the carts where their user id appears in the leader or member field
  const carts = yield db.Carts.find({
    or: [
      { leader: userIds },
      { id: memberCartsIds }
    ]
  }).populate('items').populate('leader').populate('members')

  console.log('leader carts', carts)

}).catch(console.error.bind(console))
