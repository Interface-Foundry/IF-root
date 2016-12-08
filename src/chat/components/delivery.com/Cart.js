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
  var userItem = this.foodSession.cart.filter(i => {
    return i.user_id === user_id && !i.added_to_cart && i.item.item_id === unique_id
  })[0]

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

    var q = yield this.foodSession.update({$push: {cart: userItem}}).exec()

    // now need to refresh foodSession and get the item again
    this.foodSession = yield db.Delivery.findOne({team_id: this.team_id, active: true}).exec()
    userItem = yield this.getItemInProgress(unique_id, user_id)
  }

  return userItem
}

module.exports = Cart
