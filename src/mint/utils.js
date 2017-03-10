const uuid = require('uuid');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('./db');
dbReady.then(models => db = models).catch(e => console.error(e));

// length of cart id, not sure what compromise between looking fine and getting scraped
const CART_ID_LENGTH = 12; // based on lichess game length lol
const MAGIC_URL_LENGTH = 32;

/**
 * @param {string} - session or something? idk really
 * @yield {object} cart object
 */
exports.createNewCart = function * methodName(req, session_id) {
  var cart = yield db.Carts.create({
    cart_id: uuid.v4().replace(/-/g, '').slice(0, CART_ID_LENGTH),
    magic_link: uuid.v4().replace(/-/g, '').slice(0, MAGIC_URL_LENGTH),
    cart_leader: req.session.session_id
  });

  return cart.cart_id;
};

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
  return false
};

/**
 * "Forgot Password" link basically. Not really magic.
 */
exports.generateMagicLink = function * (user, cart) {

}
