const GetStore = require('./StoreFactory').GetStore
const _ = require('lodash')

var db
const dbReady = require('../../db')

dbReady.then((models) => { db = models; })


class Cart {
  /**
   * Build a cart class from a cart database model, or settings for a new model
   * @param  {db.Cart} cart cart database object, or what you want it to be
   */
  constructor(cart) {
    // first set the default cart options if unset
    this.user_locale = cart.user_locale || 'US'
    this.items = cart.items || []

    // set the properties from the cart
    _.merge(this, cart)

    // add the store
    this.store = GetStore(this)
  }

  static async GetById(cartId) {
    const cartObject = await db.Carts.findOne({id: cartId}).populate('members').populate('items')
    var cart = new Cart(cartObject)
    if (cartObject.store_locale) {
      cart.user_locale = cartObject.store_locale
    }


    logging.info('cart', cart)
    // logging.info('does cart.sync exist', cart.sync)
    return cart
  }

  /**
   * Saves a new cart to the database
   * @return {this} returns this instance of the cart class
   */
  initialize() {
    return Promise.resolve(this)
  }

  add(item) {
    this.items.push(item.id)
    return Promise.resolve(this)
  }

  checkout() {
    this.store.checkout(this)
  }

  /**
   * sync the cart with the 3rd party api
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async sync () {
    const newCart = await this.store.sync(this)
    await this.store.updateCart(this.id, newCart)
    _.merge(this, newCart)
  }
}

module.exports = Cart
