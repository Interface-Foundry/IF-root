/**
 * @param {string}
 * @param {string}
 * @yield {object} cart object
 */
exports.createNewCart = function * methodName(cart, creator) {
  var cart = new db.Cart({
    cart_leader: creator,

  })
}


/**
 * @param {string} cart - unique identifier for cart we can look up, would be from /cart/:id
 * @yield {object} cart - returns cart object if it exists else undefined or create new cart
 */
exports.checkForCart = function * (cart) {
  var cart = yield db.Cart.findOne({cart_id: cart});
  if (!cart) {
    // cart doesnt exist
    return
  }
}

/**
 * @param {string} user - user id to check if in cart, could be
 * @param {[type]}
 * @yield {[type]} [description]
 */
exports.checkIfUserIsInCart = function * (user, cart) {
  var cart = yield db.Cart.findOne({cart_id: cart});

  if (true) {}
};
