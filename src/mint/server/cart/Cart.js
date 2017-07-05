const GetStore = require('./StoreFactory').GetStore
const _ = require('lodash')
const moment = require('moment');

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

  async addItemToCart (item, quantity) {
    if (quantity === undefined) {
      quantity = 1
    }
    item = await this.store.addItem(item, )
    return item;
  }

  async deleteItemFromCart (item, userId) {
    if (!item) {
      throw new Error('Item not found')
    }

    // Make sure user has permission to delete it, leaders can delete anything,
    // members can delete their own stuff
    if (this.cart.leader !== userId && item.added_by !== userId) {
      throw new Error('Unauthorized')
    }

    this.cart.items.remove(item.id)
    await this.cart.save()
    return this.cart
  }

  async checkout (req, res) {
    if (this.store === undefined) {
      throw new Error('Store required for checkout')
    }
    // const store = GetStore(this)
    // logging.info('STORE:', store)
    await this.store.checkout(this, req, res)
  }

  async sendCartSummary (req) {
    const userAccount = req.UserSession.user_account
    if (!userAccount) {
      throw new Error('no user')
    }

    var summary = await db.Emails.create({
      recipients: userAccount.email_address,
      sender: 'hello@kip.ai',
      subject: `Kip Cart List for ${this.name}`,
      template_name: 'summary_email',
      unsubscribe_group_id: 2485
    });

    var userItems = {}; //organize items according to which user added them
    var items= []
    var users = []
    var total = 0;
    var totalItems = 0;
    this.items.map(function (item) {
      if (!userItems[item.added_by]) userItems[item.added_by] = [];
      userItems[item.added_by].push(item);
      totalItems += Number(item.quantity || 1);
      total += (Number(item.price) * Number(item.quantity || 1));
    });

    for (var k in userItems) {
      var addingUser = await db.UserAccounts.findOne({id: k});
      if (!addingUser.name) addingUser.name || addingUser.email
      users.push(addingUser);
      items.push(userItems[k]);
    }

    await summary.template('summary_email', {
      username: userAccount.name || userAccount.email_address,
      baseUrl: 'http://' + (req.get('host') || 'mint-dev.kipthis.com'),
      id: this.id,
      items: items,
      users: users,
      date: moment().format('dddd, MMMM Do, h:mm a'),
      total: '$' + total.toFixed(2),
      totalItems: totalItems,
      cart: this
    })
    await summary.send()
  }
}

module.exports = Cart
