
/**
 * @param {string} cart - unique identifier for cart we can look up, would be from /cart/:id
 * @yield {object} cart - returns cart object if it exists else undefined or create new cart
 */
exports.checkForCart = function * (cart_id) {
  var cart = yield db.Cart.findOne({cart_id: cart_id});
  if (!cart) {
    // cart doesnt exist
  }
  return cart;
};

/**
 * @param {string} user - user id to check if in cart, could be
 * @param {[type]}
 * @yield {[type]} [description]
 */
exports.checkIfUserIsInCart = function * (user, cart_id) {
  var cart = yield db.Cart.findOne({cart_id: cart_id});

  if (cart.cart_members.contains(user)) {
    return true;
  }
  // other stuff
  return false;
};

/**
 * "Forgot Password" link basically. Not really magic.
 */
exports.generateAuthenticationLink = function * (user, cart) {
  var link = yield db.AuthenticationLinks.create({
    user: user.id,
    cart: cart.id
  });

  return link;
};
