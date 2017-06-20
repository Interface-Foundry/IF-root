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
    debugger;
    this.user_locale = cart.user_locale || 'US'
    this.items = cart.items || []

    // set the properties from the cart
    _.merge(this, cart)

    // add the store
    this.store = GetStore(this)
  }

  /**
   * retrieves a cart from the database by id
   * @param  {[type]}  cartId [description]
   * @return {Promise}        [description]
   */
  static async GetById(cartId) {
    if (!cartId) {
      throw new Error('must supply cartId')
    }

    // Fetch from the database, populating everything
    const cartObject = await db.Carts.findOne({id: cartId})
      .populate('members')
      .populate('items')
      .populate('invoice')

    if (!cartObject) {
      throw new Error('no cart in the database for object with id ' + cartId)
    }

    // create as the object
    var cart = new Cart(cartObject)
    debugger;
    if (cartObject.store_locale) {
      cart.user_locale = cartObject.store_locale
    }

    return cart
  }

  /**
   * Saves a new cart to the database
   * @return {this} returns this instance of the cart class
   */
  initialize() {
    return Promise.resolve(this)
  }

  async add(item) {
    this.items.push(item.id)

    return Promise.resolve(this)
  }

  checkout() {
    this.store.checkout(this)
  }

  /**
   * sync the cart with the 3rd party api
   *
   * @return     {Promise}
   */
  // async sync () {
  sync () {
    // const newCart = await this.store.sync(this)
    // await this.store.updateCart(this.id, newCart)
    // _.merge(this, newCart)
  }
}

module.exports = Cart
