const co = require('co')
const _ = require('lodash')
var scrape = require('../cart/scrape_url')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

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
  router.get('/carts', (req, res) => co(function * () {
    if (!_.get(req, 'UserSession.user_accounts[0]')) {
      return res.send([])
    }

    // get the list of their user ids
    const userIds = req.UserSession.user_accounts.map(a => a.id)

    // find all the carts where their user id appears in the leader or member field
    const carts = yield db.Carts.find({
      or: [
        { leader: userIds },
        { members: userIds }
      ]
    }).populate('items').populate('leader').populate('members')

    res.send(carts)
  }))

  /**
   * @api {get} /api/cart/:cart_id Cart
   * @apiDescription Gets a single cart, does not have to be logged in
   * @apiGroup Carts
   * @apiParam {string} cart_id the cart id
   *
   * @apiSuccess {[Item]} items list of items
   * @apiSuccess {UserAccount} leader the cart leader
   * @apiSuccess {[UserAccount]} members users who have added something to the cart
   * @apiSuccessExample Success-Response
   * {"members":[{"email_address":"peter@interfacefoundry.com","createdAt":"2017-03-16T16:19:10.812Z","updatedAt":"2017-03-16T16:19:10.812Z","id":"bc694263-cf19-46ea-b3f1-bd463f82ce55"}],"items":[{"original_link":"watches","quantity":1,"createdAt":"2017-03-16T16:18:32.047Z","updatedAt":"2017-03-16T16:18:32.047Z","id":"58cabad83a5cd90e34b29610"}],"leader":{"email_address":"peter.m.brandt@gmail.com","createdAt":"2017-03-16T16:18:27.607Z","updatedAt":"2017-03-16T16:18:27.607Z","id":"257cd470-f19f-46cb-9201-79b8b4a95fe2"},"createdAt":"2017-03-16T16:18:23.433Z","updatedAt":"2017-03-16T16:19:10.833Z","id":"3b10fc45616e"}
   */
  router.get('/cart/:cart_id', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id })
      .populate('leader')
      .populate('members')
      .populate('items')

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
   * @apiParam {String} cart_id
   */
  router.get('/cart/:cart_id/items', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id }).populate('items')
    if (!cart) {
      throw new Error('Cart not found')
    }

    res.send(cart.items)
  }));

  /**
   * @api {post} /api/cart/:cart_id/item Add Item
   * @apiDescription Adds an item to a cart
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart id
   * @apiParam {string} url of the item from amazon or office depot or whatever
   * @apiParam {string} user_id specify the identity which is adding the item (otherwise server picks the first authenticated identity)
   */
  router.post('/cart/:cart_id/item', (req, res) => co(function* () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_accounts[0]')) {
      throw new Error('Unauthorized')
    }

    // if they specified the user id, verify it is them
    var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
    if (req.body.user_id && !userIds.has(req.body.user_id)) {
      throw new Error('Unauthorized')
    }

    // Make sure the cart exists
    const cart = yield db.Carts.findOne({id: req.params.cart_id})
    if (!cart) {
      throw new Error('Cart not found')
    }

    // Create an item from the url
    const item = yield scrape(req.body.url)
    cart.items.add(item.id)
    item.cart = cart.id

    // specify who added it
    if (req.body.user_id) {
      item.added_by = req.body.user_id
    } else {
      item.added_by = req.UserSession.user_accounts[0].id
    }
    yield item.save()

    // Add the user to the members group of the cart if they are not part of it already
    // IF they specified a specific user_account id that they want to add the cart as,
    // use that one, otherwise use the first user id in their list
    if (req.body.user_id) {
      var isLeader = cart.leader === req.body.user_id
      var isMember = cart.members.has(req.body.user_id)
      if (!isLeader && !isMember) {
        cart.members.add(req.body.user_id)
      }
    } else {
      var isLeader = userIds.has(cart.leader)
      var isMember = cart.members.reduce((isMember, id) => isMember || userIds.has(id), false)
      if (!isLeader && !isMember) {
        cart.members.add(req.UserSession.user_accounts[0].id)
      }
    }
    yield cart.save()

    return res.send(item)
  }));

  /**
   * @api {delete} /api/cart/:cart_id/item Delete Item
   * @apiDescription Delete or subtract item from cart. The user must be a leader or a member to do this (does not have to be the person that added the item)
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart to remove item from
   * @apiParam {string} item_id the item's identifier
   */
  router.delete('/cart/:cart_id/item', (req, res) => co(function* () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_accounts[0]')) {
      throw new Error('Unauthorized')
    }

    // Make sure the cart exists
    const cart = yield db.Carts.findOne({id: req.params.cart_id})
    if (!cart) {
      throw new Error('Cart not found')
    }

    // Make sure they specified an item id
    if (!req.body.item_id) {
      throw new Error('Must specify item_id')
    }

    // find the item they want to delete
    var item = yield db.Items.findOne({
      id: req.body.item_id
    })
    if (!item) {
      throw new Error('Item not found')
    }

    // Make sure user has permission to delete it
    var isLeader = req.UserSession.user_accounts.map(a => a.id).includes(cart.leader)
    var isAdder = req.UserSession.user_accounts.map(a => a.id).includes(item.added_by)
    if (!isLeader && !isAdder) {
      throw new Error('Unauthorized')
    }

    // Remove the cart-item association
    cart.items.remove(item.id)
    yield cart.save()

    // Just say ok
    res.status(200).end()
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
  router.post('/cart/:cart_id', (req, res) => co(function * () {
    // get the cart
    var cart = yield db.Carts.findOne({id: req.params.cart_id})

    // check permissions
    var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
    if (!userIds.has(cart.leader)) {
      throw new Error('Unauthorized')
    }

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.leader
    delete req.body.members
    delete req.body.items

    _.merge(cart, req.body)
    yield cart.save()
    res.send(cart)
  }))

  /**
   * @api {post} /api/item/:item_id Update Item
   * @apiDescription Update item settings, except for id, leader, members, and items.
   * @apiGroup Carts
   * @apiParam {string} :item_id id of the item to update
   * @apiParam {json} body the properties you want to set on the item
   *
   * @apiParamExample Request
   * post /api/item/cd08ca774445 {
   *   "locked": true,
   * }
   *
   * @apiSuccessExample Response
   * {"leader":"02a20ec6-edec-46b7-9c7c-a6f36370177e","createdAt":"2017-03-28T22:59:39.134Z","updatedAt":"2017-03-28T22:59:39.662Z","id":"289e5e60a855","name":"Office Party"}
   */
  router.post('/item/:item_id', (req, res) => co(function * () {
    // get the item
    var item = yield db.Items.findOne({id: req.params.item_id}).populate('cart')

    // get the cart, too
    var cart = item.cart

    // check permissions
    var userIds = req.UserSession.user_accounts.reduce((set, a) => set.add(a.id), new Set())
    if (!userIds.has(cart.leader) && !userIds.has(item.added_by)) {
      throw new Error('Unauthorized')
    }

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.added_bys
    // TODO what should not be allowed?

    _.merge(item, req.body)
    yield item.save()
    res.send(item)
  }))

  /**
   * @api {get} /api/item/:item_id Item
   * @apiDescription Gets an item by id, populating the options and added_by fields
   * @apiGroup Carts
   * @apiParam {String} :item_id
   * @type {[type]}
   */
  router.get('/item/:item_id', (req, res) => co(function * () {
    var item = yield db.Items.findOne({id: req.params.item_id})
      .populate('options')
      .populate('added_by')
    res.send(item)
  }))
}
