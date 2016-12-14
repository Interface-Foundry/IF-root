var _ = require('lodash')
var Menu = require('./Menu')

function Cart(team_id) {
  if (!(this instanceof Cart)) {
    return new Cart(team_id)
  }
  this.team_id = team_id
}

Cart.prototype.pullFromDB = function * () {
  this.foodSession = yield db.Delivery.findOne({team_id: this.team_id, active: true}).exec()
  this.menu = Menu(this.foodSession.menu) // convenience
}

Cart.prototype.getItemInProgress = function * (unique_id, user_id) {
  console.log('GETITEMINPROGRESS_UNIQUE_ID', unique_id)
  console.log('THIS FOODSESSION CART', this.foodSession.cart)
  var userItem = this.foodSession.cart.filter(i => {
    return i.user_id === user_id && !i.added_to_cart && i.item.item_id === unique_id
  })[0]
  console.log('GETITEMINPROGRESS_USERITEM', userItem)
  if (!userItem) {
    userItem = {
      user_id: user_id,
      added_to_cart: false,
      item: {
        item_id: unique_id,
        item_qty: 1,
        option_qty: {}
      }
    }
    console.log('GETITEMINPROGRESS_USERITEMNOW', userItem)
    var q = yield this.foodSession.update({$push: {cart: userItem}}).exec()
    console.log('QQQQQQQQQQQQQQQQQQQQQQQ', q)
    // now need to refresh foodSession and get the item again
    this.foodSession = yield db.Delivery.findOne({team_id: this.team_id, active: true}).exec()
    userItem = yield this.getItemInProgress(unique_id, user_id)
  console.log('GETITEMINPROGRESS_USERITEMAGAIN', userItem)
  }

  return userItem
}

module.exports = Cart
