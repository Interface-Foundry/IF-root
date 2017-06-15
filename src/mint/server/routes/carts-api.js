const co = require('co')
const _ = require('lodash')
const url = require('url')
const amazonScraper = require('../cart/scraper_amazon')
const amazonConstants = require('../cart/amazon_constants')
const ypoConstants = require('../cart/ypo_constants')
const amazon = require('../cart/amazon_cart')
const cartUtils = require('../cart/cart_utils')
const camel = require('../deals/deals')
const googl = require('goo.gl')
const path = require('path')
const haversine = require('haversine')
const stable = require('stable')
const thunkify = require('thunkify')
const spliddit = require('spliddit')
const StoreFactory = require('../cart/StoreFactory')

const cart_types = require('../cart/cart_types')
  .stores
const countryCoordinates = require('../cart/cart_types')
  .countryCoordinates
const category_utils = require('../utilities/category_utils');
const cloning_utils = require('../utilities/cloning_utils');
const geolocation = require('../utilities/geolocation')

if (process.env.NODE_ENV !== 'production') {
  googl.setKey('AIzaSyByHPo9Ew_GekqBBEs6FL40fm3_52dS-g8')
} else {
  googl.setKey('AIzaSyCZ_lrnpJYBtjbfEcEf8kXBh1H8pJBx-bM')
}

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

/** used when querying the db since apparently we dont want to ever use emails? */
const selectMembersWithoutEmail = {
  select: ['_id', 'name', 'createdAt', 'updatedAt']
}

/**
 * dont return emails to front end
 *
 * @param      {<type>}  cartMembers  The cartesian members
 * @return     {<type>}  { description_of_the_return_value }
 */
function stripEmailsFromCartMembers(cartMembers) {
  return cartMembers.map(member => {
    delete member.email_address
    return member
  })
}

module.exports = function (router) {
  /**
   * @api {get} /api/carts User Carts
   * @apiDescription Returns all the carts that the user is a member or leader of
   * @apiGroup Carts
   *
   * @apiSuccess {[Item]} items list of items
   * @apiSuccess {UserAccount} leader the cart leader
   * @apiSuccess {[UserAccount]} members users who have added something to the cart
   *
   * @apiSuccessExample Success-Response
   * [{"members":[{"email_address":"peter@interfacefoundry.com","createdAt":"2017-03-16T16:19:10.812Z","updatedAt":"2017-03-16T16:19:10.812Z","id":"bc694263-cf19-46ea-b3f1-bd463f82ce55"}],"items":[{"original_link":"watches","quantity":1,"createdAt":"2017-03-16T16:18:32.047Z","updatedAt":"2017-03-16T16:18:32.047Z","id":"58cabad83a5cd90e34b29610"}],"leader":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-03-16T16:18:27.607Z","updatedAt":"2017-03-16T16:18:27.607Z","id":"257cd470-f19f-46cb-9201-79b8b4a95fe2"},"createdAt":"2017-03-16T16:18:23.433Z","updatedAt":"2017-03-16T16:19:10.833Z","id":"3b10fc45616e"}]
   */
  router.get('/carts', (req, res) => co(function* () {
    // if no user, no carts
    if (!_.get(req, 'UserSession.user_account.id')) {
      return res.send([])
    }

    // find all the cart ids for which the user is a member
    const memberCarts = yield db.carts_members__user_accounts_id.find({
      user_accounts_id: req.UserSession.user_account.id
    })

    const memberCartsIds = memberCarts.map(c => c.carts_members)

    // find all the carts where their user id appears in the leader or member field
    const carts = yield db.Carts.find({
        or: [
          { leader: req.UserSession.user_account.id },
          { id: memberCartsIds }
        ]
      })
      .populate('items')
      .populate('leader')
      .populate('members', selectMembersWithoutEmail)

    res.send(carts)
  }))

  //FOR TESTING
  router.get('/cart/:cart_id/clones', (req, res) => co(function * () {
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('clones')
    if (cart) res.send(cart.clones)
    else res.sendStatus(404)
  }))

  /**
   * @api {get} /api/cart/:cart_id Cart
   * @apiDescription Gets a single cart, does not have to be logged in
   * @apiGroup Carts
   * @apiParam {string} :cart_id the cart id
   *
   * @apiSuccess {[Item]} items list of items
   * @apiSuccess {UserAccount} leader the cart leader
   * @apiSuccess {[UserAccount]} members users who have added something to the cart
   * @apiSuccessExample Success-Response
   * {"members":[{"email_address":"peter@interfacefoundry.com","createdAt":"2017-03-16T16:19:10.812Z","updatedAt":"2017-03-16T16:19:10.812Z","id":"bc694263-cf19-46ea-b3f1-bd463f82ce55"}],"items":[{"original_link":"watches","quantity":1,"createdAt":"2017-03-16T16:18:32.047Z","updatedAt":"2017-03-16T16:18:32.047Z","id":"58cabad83a5cd90e34b29610"}],"leader":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-03-16T16:18:27.607Z","updatedAt":"2017-03-16T16:18:27.607Z","id":"257cd470-f19f-46cb-9201-79b8b4a95fe2"},"createdAt":"2017-03-16T16:18:23.433Z","updatedAt":"2017-03-16T16:19:10.833Z","id":"3b10fc45616e"}
   */
  router.get('/cart/:cart_id', (req, res) => co(function* () {
    // doing a stupid to test
    var user_id = _.get(req, 'UserSession.user_account.id');
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })
        .populate('leader')
        .populate('members', selectMembersWithoutEmail)
        .populate('items')

    if(user_id === cart.leader.id) {
      cart = yield db.Carts.findOne({ id: req.params.cart_id })
        .populate('leader')
        .populate('members')
        .populate('items')
    }


    if (cart && cart.privacy == 'private') {
      // if the cart is set to "private", check to see if they're logged in and if they're a member of the cart
      if (!_.get(req, 'UserSession.user_account.id')) {
        // if they're not logged in they can't see the cart
        res.sendStatus(401)
      }
      else {
        //if they're logged in but don't have the right email domain, they can't see the cart
        var userDomain = _.get(req, 'UserSession.user_account.email_address').split('@')[1]
        var leaderDomain = cart.leader.email_address.split('@')[1]
        if (userDomain !== leaderDomain) res.sendStatus(403);
      }
    }

    if (cart) {
      res.send(cart);
    } else {
      throw new Error('Cart not found')
    }

  }));

  /**
   * @api {get} /api/cart/:cart_id/items Items
   * @apiDescription Gets all items in cart
   * @apiGroup Carts
   * @apiParam {String} :cart_id
   */
  router.get('/cart/:cart_id/items', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })
      .populate('items')

    const userId = req.UserSession.user_account.id
    if (cart.leader !== userId) {
      cart.members = stripEmailsFromCartMembers(cart.members)
    }

    if (!cart) {
      throw new Error('Cart not found')
    }

    res.send(cart.items)
  }));

  /**
   * @api {get} /api/sendgrid/cart/:cart_id/itemview/:user_id/:item_id View Item (from email)
   * @apiGroup Sendgrid
   * @apiDescription This route appears to redirect to an item view in the mint cart.
   * @apiParam :cart_id {string} the cart id the item is in
   * @apiParam :user_id {string} not used, TODO remove this
   * @apiParam :item_id {string} the item id to preview in the cart
   */
  router.get('/sendgrid/cart/:cart_id/itemview/:user_id/:item_id', (req, res) => co(function* () {
    var item = yield db.Items.findOne({ id: req.params.item_id });
    res.redirect(req.protocol + '://' + req.get('host') + `/cart/${req.params.cart_id}/m/item/0/${item.asin}`)
  }))

  /**
   * @api {get} /api/sendgrid/sendgrid/cart/:cart_id/user/:user_id/item/:item_id Add Item (from email)
   * @apiGroup Sendgrid
   * @apiDescription This route appears to attempt to add an item to a cart.
   * @apiParam :cart_id {string} the cart id the item is in
   * @apiParam :user_id {string} probably shouldn't use this, TODO remove this
   * @apiParam :item_id {string} the item id to preview in the cart
   */
  router.get('/sendgrid/cart/:cart_id/user/:user_id/item/:item_id', (req, res) => co(function* () {
    var user_account = yield db.UserAccounts.findOne({ id: req.params.user_id });
    // Make sure the cart exists
    const cart = yield db.Carts.findOne({ id: req.params.cart_id })
    if (!cart) {
      throw new Error('Cart not found')
    }
    // Get or create the item, depending on if the user specifed a previewed item_id or a new url
    var item
    if (req.params.item_id) {
      // make sure it's not in a cart already
      var existingCart = yield db.Carts.findOne({ items: req.params.item_id })
      if (existingCart && existingCart.id !== cart.id) {
        throw new Error('Item ' + req.params.item_id + ' is already in another cart ' + existingCart.id)
      }
      // get the previwed item from the db
      item = yield db.Items.findOne({ id: req.params.item_id })
      logging.info('have item');
      cart.items.add(item.id)
      item.cart = cart.id

      // specify who added it
      // logging.info('user id?', req.UserSession.user_account.id)
      item.added_by = req.params.user_id
      yield item.save()
    } else throw new Error('No item_id')

    // make the user leader if no leader exists, otherwise make member
    if (!cart.leader) {
      cart.leader = req.params.user_id
    } else if (!cart.members.includes(req.params.user_id)) {
      cart.members.add(req.params.user_id)
    }

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true

    // Save all the weird shit we've added to this poor cart.
    yield cart.save()

    // // get user's session and log them in
    // var session = yield db.Sessions.findOne({user_account: req.params.user_id})
    // if (session) {
    //   req.UserSession = session;
    //   req.session.id = session.id;
    // }
    // logging.info('req.UserSession', req.UserSession)

    // And assuming it all went well we'll respond to the client with the saved item
    res.redirect(req.protocol + '://' + req.get('host') + '/cart/' + req.params.cart_id);
  }))

  /**
   * @api {post} /api/cart/:cart_id/item Add Item
   * @apiDescription Adds an item to a cart. Must specify either url or item_id in the request body. The item_id param is meant for adding a previewd item to cart, not for adding an item from some other cart to this cart.
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart id
   * @apiParam {string} url optional url of the item from amazon or office depot or whatever
   *
   * @apiParamExample Item from Preview
   * POST https://mint.kipthis.com/api/cart/123456/item {
   *   item_id: 'abc-123456',
   *   user_id: '123456y'
   * }
   *
   * @apiParamExample Item from URL
   * POST https://mint.kipthis.com/api/cart/123456/item {
   *   url: 'https://www.amazon.com/Proctor-Silex-Belgian-Waffle-26070/dp/B00JR5AAWW/ref=sr_1_15?s=kitchen&ie=UTF8&qid=1491404786&sr=1-15&keywords=waffle+iron',
   *   user_id: '123456y'
   * }
   */
  router.post('/cart/:cart_id/item', (req, res) => co(function* () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    const currentUser = yield db.UserAccounts.findOne(_.get(req, 'UserSession.user_account.id'));
    var userId = currentUser.id

    // Make sure the cart exists
    const cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('leader')
    if (!cart) {
      throw new Error('Cart not found')
    }

    logging.info('current privacy setting:', cart.privacy)

    //if the cart is display, the user must be the cart leader
    if (cart.privacy == 'display' && currentUser.id !== cart.leader.id) {
      return res.sendStatus(403);
    }

    //if the cart is private, the user must be in the same domain
    if (cart.privacy == 'private' && currentUser.email_address.split('@')[1] !== cart.leader.email_address.split('@')[1]) {
      return res.sendStatus(403);
    }
    // make the user leader if no leader exists, otherwise make member
    if (!cart.leader) {
      cart.leader = userId
    } else if (!cart.members.includes(userId)) {
      cart.members.add(userId)
    }

    // Get or create the item, depending on if the user specifed a previewed item_id or a new url
    var item
    if (req.query.item_id && !req.body.item_id) req.body.item_id = req.query.item_id
    if (req.body.item_id) {
      // make sure it's not in a cart already
      var existingCart = yield db.Carts.findOne({ items: req.body.item_id })
      if (existingCart && existingCart.id !== cart.id) {
        throw new Error('Item ' + req.body.item_id + ' is already in another cart ' + existingCart.id)
      }
      // get the previwed item from the db
      item = yield db.Items.findOne({ id: req.body.item_id })
    } else {
      // Create an item from the url
      item = yield cartUtils.addItem(req.body, cart, 1)
    }

    // join the two database documents
    cart.items.add(item.id)
    item.cart = cart.id

    // specify who added it
    item.added_by = userId

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true

    // Save all the weird shit we've added to this poor cart.
    yield [item.save(), cart.save()]

    return res.send(item)
  }));

  /**
   * @api {put} /cart/:cart_id/item/:item_id/update Update Item
   * @apiDescription Updates an item already in a cart. Must specify new item.
   * Right now just replaces old item with new item
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart id
   * @apiParam {string} :item_id item id
   *
   * @apiParamExample Item from Preview
   * PUT https://mint.kipthis.com/api/cart/123456/item {
   *   new_item_id: 'abc-123456'
   * }
   */
  router.put('/cart/:cart_id/item/:item_id/update', (req, res) => co(function* () {
    if (!_.get(req, 'body.new_item_id')) {
      throw new Error('Only accepting ids in new item at the moment')
    }
    const newItemId = req.body.new_item_id
    const user_id = req.UserSession.user_account.id
    let cart = yield db.Carts.findOne({ id: req.params.cart_id })
    const oldItem = yield db.Items.findOne({ id: req.params.item_id })

    // make sure cart and item exist
    if (!cart) {
      throw new Error('Cart not found')
    }
    if (!oldItem) {
      throw new Error('Old Item not found')
    }

    cart = yield cartUtils.deleteItemFromCart(oldItem, cart, user_id)
    const newItem = yield db.Items.findOne({ id: newItemId })

    // join the two database documents
    cart.items.add(newItem.id)
    newItem.cart = cart.id

    // specify who added it
    newItem.added_by = user_id

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true
    yield [newItem.save(), cart.save()]

    return res.send(newItem)
  }));

  /**
   * @api {put} /api/cart/:cart_id/privacy/:setting Privacy setting
   * @apiDescription Update cart privacy setting (default is 'public')
   * Value of :setting must be 'public', 'private', or 'display'
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart whose privacy we are modifying
   * @apiParam {string} :setting privacy setting we want the cart to have
   */
  router.put('/cart/:cart_id/privacy/:setting', (req, res) => co(function * () {
    if (!req.UserSession) return res.sendStatus(401)

    const user_id = req.UserSession.user_account.id
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('leader');
    var setting = req.params.setting

    if (!cart) return res.sendStatus(404);
    if (cart.leader.id !== user_id) return res.sendStatus(403)
    if (setting !== 'public' && setting !== 'private' && setting != 'display') {
      return res.sendStatus(400);
    }

    cart.privacy = setting;
    yield cart.save()
    return res.send(cart)
  }))

  /**
   * @api {delete} /api/cart/:cart_id/clear Clear
   * @apiDescription Clears all the items from the whole cart. rm -rf cart items.
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart to clear
   *
   * @apiParamExample Request
   * DELETE https://mint.kipthis.com/api/cart/123456/clear
   */
  router.delete('/cart/:cart_id/clear', (req, res) => co(function* () {
    // only leaders have sudo rm -rf permission
    const cart = yield db.Carts.findOne({
        id: req.params.cart_id
      })
      .populate('leader')
      .populate('items')

    if (_.get(req, 'UserSession.user_account.id') !== _.get(cart, 'leader.id')) {
      throw new Error('Unauthorized, only cart leader can clear cart items')
    }
    cart.items.map(i => cart.items.remove(i.id))

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true
    yield cart.save()
    res.status(200)
      .end()
  }))

  /**
   * @api {delete} /api/cart/:cart_id/clear Delete
   * @apiDescription archive, delete, cold storage, whatever, just make it so that no user can ever see it again.
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart to delete
   *
   * @apiParamExample Request
   * DELETE https://mint.kipthis.com/api/cart/123456
   */
  router.delete('/cart/:cart_id', (req, res) => co(function* () {
    // only leaders have sudo rm -rf permission
    const cart = yield db.Carts.findOne({
        id: req.params.cart_id
      })
      .populate('leader')
      .populate('items')

    console.log('cart??', cart)

    // if the cart doesn't exist, neat. congrats.
    if (!cart) {
      console.log('CART')
      return res.sendStatus(200)
        .end()
    }

    if (_.get(req, 'UserSession.user_account.id') !== _.get(cart, 'leader.id')) {
      throw new Error('Unauthorized, only cart leader can clear cart items')
    }

    // archive the cart
    yield cart.archive()
    res.status(200)
      .end()
  }))

  /**
   * @api {delete} /api/cart/:cart_id/item/:item_id Delete Item
   * @apiDescription Delete or subtract item from cart. The user must be a leader or a member to do this (does not have to be the person that added the item)
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart to remove item from
   * @apiParam {string} :item_id the item to delete
   *
   * @apiParamExample Request
   * DELETE https://mint.kipthis.com/api/cart/123456/item/998765
   */
  router.delete('/cart/:cart_id/item/:item_id', (req, res) => co(function* () {

    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // this will be handy later now that we know it exists
    const userId = req.UserSession.user_account.id

    // Make sure the cart exists
    const cart = yield db.Carts.findOne({ id: req.params.cart_id })
    if (!cart) {
      throw new Error('Cart not found')
    }

    // Make sure they specified an item id
    if (!req.params.item_id) {
      throw new Error('Must specify item_id')
    }

    // find the item they want to delete
    var item = yield db.Items.findOne({
      id: req.params.item_id
    })
    if (!item) {
      throw new Error('Item not found')
    }

    // Make sure user has permission to delete it, leaders can delete anything, members can delete their own stuff
    if (cart.leader !== userId && item.added_by !== userId) {
      throw new Error('Unauthorized')
    }

    // Remove the cart-item association
    cart.items.remove(item.id)

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true

    yield cart.save()

    // Just say ok
    res.status(200)
      .end()
  }));

  /**
   * @api {post} /api/cart/:cart_id Update Cart
   * @apiDescription Update cart settings, except for id, leader, members, and items.
   * @apiGroup Carts
   * @apiParam {string} :cart_id id of the cart to update
   * @apiParam {json} body the properties you want to set on the cart
   *
   * @apiParamExample Request
   * post /api/cart/cd08ca774445 {
   *   "name": "Office Party",
   * }
   *
   * @apiSuccessExample Response
   * {"leader":"02a20ec6-edec-46b7-9c7c-a6f36370177e","createdAt":"2017-03-28T22:59:39.134Z","updatedAt":"2017-03-28T22:59:39.662Z","id":"289e5e60a855","name":"Office Party"}
   */
  router.post('/cart/:cart_id', (req, res) => co(function* () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // this will be handy later now that we know it exists
    const userId = req.UserSession.user_account.id

    // get the cart
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })

    // check permissions
    if (cart.leader !== userId) {
      throw new Error('Unauthorized')
    }

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.leader
    delete req.body.items // need to go through post /api/cart/:cart_id/item route
    delete req.body.store
    delete req.body.store_locale
    delete req.body.parent_clone
    delete req.body.parent_reorder

    _.merge(cart, req.body)

    // Mark the cart as dirty (needs to be resynced with amazon or whatever store)
    cart.dirty = true
    yield cart.save()

    res.send(cart)
  }))

  /**
   * @api {get} /api/views/:cart_id Get social engagement metrics
   * @apiDescription Get the number of times a cart has been viewed, rekipped, and checked out
   * @apiGroup Carts
   * @apiParam {string} :cart_id the id of the cart whose data we want to access
   */
  router.get('/cart/:cart_id/metrics', (req, res) => co(function * () {
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('checkouts').populate('likes');
    if (!cart) return res.sendStatus(404);
    var clones = yield cloning_utils.getChildren(cart.id, 'clone')
    //count checkouts for all of the clones
    clone_checkouts = yield clones.map(function * (clone_id) {
      var clone = yield db.Carts.findOne({id: clone_id}).populate('checkouts')
      return clone.checkouts.length
    })
    var checkouts = cart.checkouts.length + clone_checkouts.reduce((a, b) => a + b, 0)
    return res.send({
      views: cart.views, // views is just for the current cart; not its descendents
      clones: clones.length,
      checkouts: checkouts,
      likes: cart.likes
    });
  }))

  /**
    * @api {post} /api/share/:cart_id Share
    * @apiGroup Carts
    * @apiDescription Sends the share cart email to the cart leader
    * @apiParam {string} :cart_id the id of the cart to share
    *
    */
  router.post('/share/:cart_id', (req, res) => co(function * () {
    // get the cart and leader
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })
      .populate('items');;
    var leader = yield db.UserAccounts.findOne({ id: cart.leader });

    // send email
    var share = yield db.Emails.create({
      sender: 'Kip <hello@kip.ai>',
      recipients: (leader.email ? leader.email : leader.email_address),
      subject: "Share your cart",
      template_name: 'share_cart_demo'
    });

    //pull most recent camel deals from db
    var deals = yield camel.getDeals(6);
    deals = [deals.slice(0, 2), deals.slice(2, 4), deals.slice(4, 6)];

    yield share.template('share_cart_demo', {
      id: cart.id,
      cartItems: cart.items,
      deals: deals,
      cart: cart
    });
    console.log('about to send the email to ' + (leader.email ? leader.email : '...' + leader.email_address));
    yield share.send();

    // Send a happy status that the sharing was successful
    res.status(200)
      .end()
  }))

  /**
   * @api {get} /api/views/:cart_id Get Views
   * @apiDescription Get the number of times a cart has been viewed
   * @apiGroup Carts
   * @apiParam {string} :cart_id the id of the cart whose views we want to access
   */
  router.get('/views/:cart_id', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id });
    if (!cart) res.sendStatus(404);
    else return res.send({
      views: cart.views
    });
  }))

  /**
   * @api {put} /api/views/:cart_id Views++
   * @apiDescription Increment the number of times a cart has been viewed
   * @apiGroup Carts
   * @apiParam {string} :cart_id the id of the cart whose views we want to increment
   */
  router.put('/views/:cart_id', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id });
    if (!cart) return res.sendStatus(404);
    else {
      cart.views++;
      yield cart.save();
      return res.send(cart);
    }
  }))

  /**
   * @api {post} /api/item/:item_id Update Item
   * @apiDescription Update item settings, except for id, added_by
   * @apiGroup Carts
   * @apiParam {string} :item_id id of the item to update
   * @apiParam {json} body the properties you want to set on the item
   *
   * @apiParamExample Request
   * POST /api/item/cd08ca774445 {
   *   "locked": true,
   * }
   *
   * @apiSuccessExample Response
   * {"leader":"02a20ec6-edec-46b7-9c7c-a6f36370177e","createdAt":"2017-03-28T22:59:39.134Z","updatedAt":"2017-03-28T22:59:39.662Z","id":"289e5e60a855","name":"Office Party"}
   */
  router.post('/item/:item_id', (req, res) => co(function* () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // this will be handy later now that we know it exists
    const userId = req.UserSession.user_account.id

    // get the item
    var item = yield db.Items.findOne({ id: req.params.item_id })
      .populate('cart')

    // get the cart, too
    var cart = item.cart

    // check permissions
    if (cart.leader !== userId && item.added_by !== userId) {
      throw new Error('Unauthorized')
    }

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.added_by

    _.merge(item, req.body)
    yield item.save()

    // mark the cart as dirty
    if (!cart.dirty) {
      cart.dirty = true
      yield cart.save()
    }

    res.send(item)
  }))

  /**
   * @api {get} /api/item/:item_id Item
   * @apiDescription Gets an item by id, populating the options and added_by fields
   * @apiGroup Carts
   * @apiParam {String} :item_id
   */
  router.get('/item/:item_id', (req, res) => co(function* () {
    var item = yield db.Items.findOne({ id: req.params.item_id })
      .populate('options')
      .populate('added_by', selectMembersWithoutEmail)
    res.send(item)
  }))

  /**
   * @api {get} /api/item/:item_id/reactions Get Reactions
   * @apiDescription get all reactions on an item
   * @apiGroup Carts
   * @apiParam {String} :item_id
   */
  router.get('/item/:item_id/reactions', (req, res) => co(function* () {
    var item = yield db.Items.findOne({ id: req.params.item_id })
      .populate('reactions')
    if (!item) return res.sendStatus(404);
    return res.send(item.reactions);
  }))

  /**
   * @api {get} /api/item/:item_id/reaction/:user_id Get User Reactions
   * @apiDescription get a single reaction on an item associated with a specific user
   * @apiGroup Carts
   * @apiParam {String} :item_id
   * @apiParam {String} :user_id
   */
  router.get('/item/:item_id/reaction/:user_id', (req, res) => co(function* () {
    var item = yield db.Items.findOne({ id: req.params.item_id })
      .populate('reactions')
    if (!item) return res.sendStatus(404);
    var reaction = item.reactions.filter(r => r.user == req.params.user_id)[0]
    return res.send(reaction);
  }))

  /**
   * @api {post} /api/item/:item_id/reaction/:user_id
   * @apiDescription create a single reaction on an item associated with a specific user
   * @apiGroup Carts
   * @apiParam {String} :item_id
   * @apiParam {String} :user_id
   * @apiParam {String} emoji - the reaction should be posted in the body
   */
  router.post('/item/:item_id/reaction/:user_id', (req, res) => co(function * () {
   var item = yield db.Items.findOne({
     id: req.params.item_id
   }).populate('reactions')
   if (!item) {
     logging.info('item not found')
     return res.sendStatus(404);
   }

   //validate emoji as single character
   logging.info('emoji:', req.body.emoji)

   var emojiChars = spliddit(req.body.emoji)

   if (emojiChars.length > 80) return res.send('input too long')

   //has the user already reacted? if so, update the character
   var previousReaction = item.reactions.filter(r => r.user == req.params.user_id)[0]
   if (previousReaction) {
     previousReaction.emoji = req.body.emoji;
     yield previousReaction.save();
     return res.send(previousReaction)
   }
   else {
     logging.info('req.body.emoji:', req.body.emoji)
     var newReaction = yield db.Reactions.create({
       emoji: req.body.emoji,
       user: req.params.user_id,
       item: req.params.item_id
     })
     item.reactions.add(newReaction.id);
     yield item.save()
     return res.send(newReaction);
   }
  }))

  /**
   * @api {post} /api/item/:item_id/clone
   * @apiParam :item_id the item we are cloning
   * @apiParam :cart_id the cart we are adding it to
   */
  router.post('/item/:item_id/clone/:cart_id', (req, res) => co(function* () {
    var user_id = _.get(req, 'UserSession.user_account.id')
    if (!user_id) throw new Error('User not logged in')
    var clone = yield cloning_utils.cloneItem(req.params.item_id, user_id, req.params.cart_id)
    var cart = yield db.Carts.findOne({id: req.params.cart_id})
    cart.items.add(clone.id)
    yield cart.save()
    res.send(clone)
  }))

  /**
   * @api {delete} /api/item/:item_id/reaction/:user_id Delete Reaction
   * @apiGroup Carts
   * @apiDescription remove a specific reaction off an item on behalf of a user
   * @apiParam {String} :item_id
   * @apiParam {String} :user_id
   */
  router.delete('/item/:item_id/reaction/:user_id', (req, res) => co(function * () {
   var item = yield db.Items.findOne({id: req.params.item_id}).populate('reactions')
   if (!item) return res.sendStatus(404);
   var reaction = item.reactions.filter(r => r.user == req.params.user_id)[0]
   item.reactions.remove(reaction.id);
   yield item.save();
   yield reaction.destroy();
   res.send('success');
  }))

  /**
   * @api {post} /api/likes/:cart_id
   * @apiGroup Carts
   * @apiDescription allows the currently logged-in user to "like" the cart
   * @apiParam {String} :cart_id the cart receiving the like
   */
  router.post('/likes/:cart_id', (req, res) => co(function * () {
    var user_id = _.get(req, 'UserSession.user_account.id')
    if (!user_id) throw new Error('User not logged in')
    // user_id = '703d08f6-5b29-412e-a1d2-ee2ba39eed24'
    // user_id = '84d7bb7d-d5b8-4902-a8df-0e86a6f435ae'

    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('likes')
    cart.likes.add(user_id)
    yield cart.save()
    var modifiedCart = yield db.Carts.findOne({id: req.params.cart_id}).populate('likes')
    res.send(modifiedCart.likes)
  }))

  /**
   * @api {put} /api/likes/:cart_id
   * @apiGroup Carts
   * @apiDescription allows the currently logged-in user to "unlike" the cart
   * @apiParam {String} :cart_id the cart from which the like is being removed
   */
   router.put('/likes/:cart_id', (req, res) => co(function * () {
     var user_id = _.get(req, 'UserSession.user_account.id')
     if (!user_id) throw new Error('User not logged in')
    //  user_id = '703d08f6-5b29-412e-a1d2-ee2ba39eed24'
    // user_id = '84d7bb7d-d5b8-4902-a8df-0e86a6f435ae'

     var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('likes')
     cart.likes.remove(user_id)
    //  var likes = cart.likes
     yield cart.save()

     var modifiedCart = yield db.Carts.findOne({id: req.params.cart_id}).populate('likes')
     res.send(modifiedCart.likes)
   }))

  /**
   * @api {get} /api/itempreview?q=:q&page=:page&category=:category Item Preview
   * @apiDescription Gets an item for a given url, ASIN, or search string, but does not add it to cart. Use 'post /api/cart/:cart_id/item {item_id: item_id}' to add to cart later.
   * @apiGroup Carts
   * @apiParam {String} :q either a url, asin, or search text
   * @apiParam {String} :page page of amazon search results
   * @apiParam {String} :category category name to bound the results of the search
   *
   * @apiParamExample url preview
   * GET https://mint.kipthis.com/api/itempreview?q=https%3A%2F%2Fwww.amazon.com%2FOnitsuka-Tiger-Mexico-Classic-Running%2Fdp%2FB00L8IXMN0%2Fref%3Dsr_1_11%3Fs%3Dapparel%26ie%3DUTF8%26qid%3D1490047374%26sr%3D1-11%26nodeID%3D679312011%26psd%3D1%26keywords%3Dasics%252Bshoes%26th%3D1%26psc%3D1
   *
   * @apiParamExample asin preview
   * GET https://mint.kipthis.com/api/itempreview?q=1234567
   *
   * @apiParamExample query preview
   * GET https://mint.kipthis.com/api/itempreview?q=travel%20hand%20sanitizer
   */
  router.get('/itempreview', (req, res) => (async function () {
    // parse the incoming text to extract either an asin, url, or search query
    const q = (req.query.q || '')
      .trim()
    if (!q) {
      throw new Error('must supply a query string parameter "q" which can be an asin, url, or search text')
    }
    const searchOpts = _.omitBy({
      text: q,
      category: _.get(req, 'query.category')
    }, _.isUndefined)
    const store = _.get(req, 'query.store', 'amazon')
    const locale = _.get(req, 'query.store_locale', 'US')
    var storeInstance = StoreFactory.GetStore({ store: store + '_' + locale.toLowerCase() })
    console.log('store instance', (storeInstance || {})
      .name)
    var results = await storeInstance.search(searchOpts)
    res.send(results)
  })())

  /**
   * @api {get} /api/cart/:cart_id/clone
   * @apiDescription Creates a copy of the cart without reactions or members
   * @apiGroup Carts
   * @apiParam {String} :cart_id the id of the cart to be copied
   */
  router.get('/cart/:cart_id/clone', (req, res) => co(function * () {
    var user_id = _.get(req, 'UserSession.user_account.id')
    if (!user_id) throw new Error('User not logged in')

    var clone = yield cloning_utils.clone(req.params.cart_id, user_id);
    return res.send(clone);
  }))

  /**
   * @api {get} /api/cart/:cart_id/reorder
   * @apiDescription Creates a more complete copy of the cart, with everything except for reactions
   * @apiGroup Carts
   * @apiParam {String} :cart_id the id of the cart to be copied
   */
  router.get('/cart/:cart_id/reorder', (req, res) => co(function * () {
    var user_id = _.get(req, 'UserSession.user_account.id')
    //for testing:
    if (!user_id) user_id = '703d08f6-5b29-412e-a1d2-ee2ba39eed24'

    var clone = yield cloning_utils.reorder(req.params.cart_id, user_id);
    logging.info('got clone', clone)
    return res.send(clone);
  }))

  /**
   * @api {get} /api/cart/:cart_id/checkout Checkout
   * @apiDescription Does some upkeep on the back end (like locking items) and redirects to the amazon cart page
   * @apiGroup Carts
   * @apiParam {String} :cart_id the cart id
   */
  router.get('/cart/:cart_id/checkout', (req, res) => co(function* () {
    // go to prototype
    // return res.redirect('/prototype/checkout')
    // get the cart
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('items').populate('checkouts')
    // checkout removes the items from the cart object, so we have to make a copy
    var items = cart.items.slice()
    var user_id = _.get(req, 'UserSession.user_account.id')

    yield cartUtils.checkout(cart, req, res)

    // create a new checkout event for record-keeping purposes
    var event = yield db.CheckoutEvents.create({
      cart: cart.id,
      user: user_id
    })

    // and attach it to the cart and the user
    var user = yield db.UserAccounts.findOne({id: user_id}).populate('checkouts')
    user.checkouts.add(event)
    cart.checkouts.add(event)
    yield user.save()

    cart.items = items;
    cart.locked = true;
    yield cart.save()
    yield cartUtils.sendReceipt(cart, req)
  }))

  /**
   * @api {get} /api/item/:item_id/clickthrough Item Clickthrough
   * @apiDescription Logs metrics, adds our affiliate tag, and redirects to the amazon item detail page
   * @apiGroup Carts
   * @apiParam {String} :item_id the item id
   */
  router.get('/item/:item_id/clickthrough', (req, res) => co(function* () {
    // get the item
    var item = yield db.Items.findOne({ id: req.params.item_id })

    // get the item's locale
    var locale = 'US'
    if (item.original_link.match(/amazon.ca/)) {
      locale = 'CA'
    } else if (item.original_link.match(/amazon.co.uk/)) {
      locale = 'UK'
    }

    // let amazon compose a nice link for us
    var amazonItem = yield amazon.lookupAmazonItem(item.asin, locale)

    // handle errors
    if (!_.get(amazonItem, 'Item.DetailPageURL')) {
      console.error('Error getting amazon item, request response:')
      console.error(amazonItem)
      throw new Error('No DetailPageURL returned for clickthrough for amazon item asin ' + item.asin)
    }

    // redirect to the cart url
    const affiliateUrl = yield googl.shorten(`http://motorwaytoroswell.space/product/${encodeURIComponent(amazonItem.Item.DetailPageURL)}/id/mint/pid/${amazonItem.Item.ASIN}`)
    res.redirect(amazonItem.Item.DetailPageURL)
  }))

  /**
   * @api {get} /api/cart_type Get Types
   * @apiDescription Retrieves a list of cart types sorted by the user's IP location and country
   * @apiGroup Carts
   */
  router.get('/cart_type', (req, res) => co(function* () {

    var geo = geolocation(req.ip) || geolocation.default
    var country = geo.country;
    var userCoords = {
      latitude: geo.ll[0],
      longitude: geo.ll[1]
    }

    // assemble list of stores
    var stores = [];

    // first sort the stores by distance to / from the user
    // using haversine, which calculates distance on a sphere
    // because earth, unfortunately, is a sphere
    stores = cart_types.sort(function (a, b) {
      var coordsA = countryCoordinates[a.store_countries[0]]
      var coordsB = countryCoordinates[b.store_countries[0]]
      var havA = haversine(userCoords, { latitude: coordsA[0], longitude: coordsA[1] });
      var havB = haversine(userCoords, { latitude: coordsB[0], longitude: coordsB[1] })
      return Math.abs(havA) - Math.abs(havB)
    })
    // but since the geocoordinates of countries are pretty random,
    // the country a user is in won't necessarily be the country that they're "closest" to
    // so resort the list by "is this the right country",
    // using a stable sort to keep everything else still ordered by distance
    stores = stable(stores, function (a, b) {
      if (a.store_countries.indexOf(country) > -1 && b.store_countries.indexOf(country) <= -1) return -1;
      else if (b.store_countries.indexOf(country) > -1 && a.store_countries.indexOf(country) <= -1) return 1;
      else return 0;
    })

    // if we're in production, don't show YPO
    if (process.env.YPO_ENABLED !== undefined || process.env.YPO_ENABLED === false) {
      logging.info('hiding ypo on production')
      stores = stores.filter(function (s) {
        return s.store_type != 'ypo'
      });
    }

    // logging.info('stores', stores)
    res.send(stores)
  }))

  /**
   * @api {get} /api/categories/:cart_id Get Categories
   * @apiDescription Retrieves a JSON of item categories -- currently just from a file for YPO
   * @apiGroup Carts
   * @apiParam {String} :cart_id the cart id
   */
  router.get('/categories/:cart_id', (req, res) => co(function* () {
    // the cart has the store and locale information, which we need to know what cateogires to show
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })

    switch (cart.store) {
    case 'amazon':
      if (amazonConstants.categories[cart.store_locale]) {
        var amazonCategories = amazonConstants.categories[cart.store_locale]
        var arrayCategories = Object.keys(amazonCategories)
          .map(cat => {
            return {
              humanName: cat,
              machineName: amazonCategories[cat],
              searchType: 'category',
              id: amazonCategories[cat]
            }
          })
        return res.send(arrayCategories);
      } else {
        throw new Error('Cannot fetch categories for unhandled amazon store locale: ' + cart.store_locale)
      }
      break;
    case 'ypo':
      var arrayCategories = yield category_utils.getYpoCategories()
      res.send(arrayCategories)
      break;
    default:
      throw new Error('Cannot fetch categories for unhandled cart type: ' + cart.store)
    }
  }))
}
