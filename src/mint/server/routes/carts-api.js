const co = require('co')
const _ = require('lodash')
const moment = require('moment')
const url = require('url')
const amazonScraper = require('../cart/scraper_amazon')
const amazon = require('../cart/amazon_cart')
const cartUtils = require('../cart/cart_utils')
const camel = require('../deals/deals')
const googl = require('goo.gl')
const fs = require('co-fs')
const path = require('path')
const thunkify = require('thunkify')
const ipinfo = thunkify(require('ipinfo'))

const cart_types = require('../cart/cart_types').stores
const country_coordinates = require('../cart/cart_types').country_coordinates

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
  router.get('/carts', (req, res) => co(function * () {
    // if no user, no carts
    if (!_.get(req, 'UserSession.user_account.id')) {
      return res.send([])
    }

    // find all the cart ids for which the user is a member
    const memberCarts = yield db.carts_members__user_accounts_id.find({
      user_accounts_id: req.UserSession.user_account.id
    })

    const memberCartsIds = memberCarts.map( c => c.carts_members )

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

    var cart = yield db.Carts.findOne({ id: req.params.cart_id })
      .populate('leader')
      .populate('members', selectMembersWithoutEmail)
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
  router.get('/sendgrid/cart/:cart_id/itemview/:user_id/:item_id', (req, res) => co(function * () {
    var item = yield db.Items.findOne({id: req.params.item_id});
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
  router.get('/sendgrid/cart/:cart_id/user/:user_id/item/:item_id', (req, res) => co(function * () {
    var user_account = yield db.UserAccounts.findOne({id: req.params.user_id});
    // Make sure the cart exists
    const cart = yield db.Carts.findOne({id: req.params.cart_id})
    if (!cart) {
      throw new Error('Cart not found')
    }
    // Get or create the item, depending on if the user specifed a previewed item_id or a new url
    var item
    if (req.params.item_id) {
      // make sure it's not in a cart already
      var existingCart = yield db.Carts.findOne({items: req.params.item_id})
      if (existingCart && existingCart.id !== cart.id) {
        throw new Error('Item ' + req.params.item_id + ' is already in another cart ' + existingCart.id)
      }
      // get the previwed item from the db
      item = yield db.Items.findOne({id: req.params.item_id})
      logging.info('have item');
      cart.items.add(item.id)
      item.cart = cart.id

      // specify who added it
      // logging.info('user id?', req.UserSession.user_account.id)
      item.added_by = req.params.user_id
      yield item.save()
    }
    else throw new Error('No item_id')

    // make the user leader if no leader exists, otherwise make member
    if (!cart.leader) {
      cart.leader = req.params.user_id
    } else if (!cart.members.includes(req.params.user_id)) {
      cart.members.add(req.params.user_id)
    }

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
  router.post('/cart/:cart_id/item', (req, res) => co(function * () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // Make sure the cart exists
    const cart = yield db.Carts.findOne({id: req.params.cart_id})
    if (!cart) {
      throw new Error('Cart not found')
    }

    // Get or create the item, depending on if the user specifed a previewed item_id or a new url
    var item
    if (req.query.item_id && !req.body.item_id) req.body.item_id = req.query.item_id
    if (req.body.item_id) {
      // make sure it's not in a cart already
      var existingCart = yield db.Carts.findOne({items: req.body.item_id})
      if (existingCart && existingCart.id !== cart.id) {
        throw new Error('Item ' + req.body.item_id + ' is already in another cart ' + existingCart.id)
      }
      // get the previwed item from the db
      item = yield db.Items.findOne({id: req.body.item_id})
    } else {
      // Create an item from the url
      item = yield amazonScraper.scrapeUrl(req.body.url)
    }
    cart.items.add(item.id)
    item.cart = cart.id

    // specify who added it
    logging.info('user id?', req.UserSession.user_account.id)
    item.added_by = req.UserSession.user_account.id
    yield item.save()

    // make the user leader if no leader exists, otherwise make member
    if (!cart.leader) {
      cart.leader = req.UserSession.user_account.id
    } else if (!cart.members.includes(req.UserSession.user_account.id)) {
      cart.members.add(req.UserSession.user_account.id)
    }

    // Save all the weird shit we've added to this poor cart.
    yield cart.save()

    // And assuming it all went well we'll respond to the client with the saved item
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
   *   new_item_asin: 'abc-123456',
   *   user_id: '123456y'
   * }
   */
  router.put('/cart/:cart_id/item/:item_id/update', (req, res) => co(function* () {
    if (!_.get(req, 'body.new_item_asin')) {
      throw new Error('Only accepting asins in new item at the moment')
    }
    const newItemAsin = req.body.new_item_asin
    const userId = req.UserSession.user_account.id
    let cart = yield db.Carts.findOne({id: req.params.cart_id})
    const oldItem = yield db.Items.findOne({id: req.params.item_id})

    // make sure cart and item exist
    if (!cart) {
      throw new Error('Cart not found')
    }
    if (!oldItem) {
      throw new Error('Old Item not found')
    }

    cart = yield cartUtils.deleteItemFromCart(oldItem, cart, userId)
    const newItem = yield cartUtils.addItemToCart(newItemAsin, cart, userId, oldItem.quantity)
    return res.send(newItem)
  }));

  /**
   * @api {delete} /api/cart/:cart_id/clear Clear
   * @apiDescription Clears all the items from the whole cart. rm -rf cart items.
   * @apiGroup Carts
   * @apiParam {string} :cart_id cart to clear
   *
   * @apiParamExample Request
   * DELETE https://mint.kipthis.com/api/cart/123456/clear
   */
   router.get('/cart/:cart_id/clear', (req, res) => co(function * () {
     // only leaders have sudo rm -rf permission
     const cart = yield db.Carts.findOne({
       id: req.params.cart_id
     }).populate('leader').populate('items')

     if (_.get(req, 'UserSession.user_account.id') !== _.get(cart, 'leader.id')) {
       throw new Error('Unauthorized, only cart leader can clear cart items')
     }
     cart.items.map(i => cart.items.remove(i.id))
     yield cart.save()
     res.status(200).end()
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
    const cart = yield db.Carts.findOne({id: req.params.cart_id})
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
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // this will be handy later now that we know it exists
    const userId = req.UserSession.user_account.id

    // get the cart
    var cart = yield db.Carts.findOne({id: req.params.cart_id})

    // check permissions
    if (cart.leader !== userId) {
      throw new Error('Unauthorized')
    }

    if (_.get(req, 'body.store')) {
      // tbh i dont know if this should just be part of _.merge() below but doing this like so for time being
      cart.store = req.body.store
      yield cart.save()
      return res.send(cart)
    }

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.leader
    delete req.body.items // need to go through post /api/cart/:cart_id/item route

    _.merge(cart, req.body)
    yield cart.save()
    res.send(cart)
  }))

  /**
    * @api {post} /api/share/:cart_id Share
    * @apiGroup Carts
    * @apiDescription Sends the share cart email to the cart leader
    * @apiParam {string} :cart_id the id of the cart to share
    *
    */
  router.post('/share/:cart_id', (req, res) => co(function * () {
    // only available for logged-in Users
    // if (!_.get(req, 'UserSession.user_account.id')) {
    //   throw new Error('Unauthorized')
    // }

    // get the cart and leader
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('items');;
    var leader = yield db.UserAccounts.findOne({id: cart.leader});

    //TODO send email
    var share = yield db.Emails.create({
      sender: 'Kip <hello@kip.ai>',
      recipients: (leader.email ? leader.email : leader.email_address),
      subject: "Share your cart",
      template_name: 'share_cart_demo'
    });

    //pull most recent camel deals from db
    var deals = yield camel.getDeals(6);
    logging.info('allDeals', deals)
    deals = [deals.slice(0, 2), deals.slice(2, 4), deals.slice(4, 6)];

    yield share.template('share_cart_demo', {
      id: cart.id,
      cartItems: cart.items,
      deals: deals,
      cart: cart
    });
    console.log('about to send the email to ' + (leader.email ? leader.email : '...' + leader.email_address)) ;
    yield share.send();
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
  router.post('/item/:item_id', (req, res) => co(function * () {
    // only available for logged-in Users
    if (!_.get(req, 'UserSession.user_account.id')) {
      throw new Error('Unauthorized')
    }

    // this will be handy later now that we know it exists
    const userId = req.UserSession.user_account.id

    // get the item
    var item = yield db.Items.findOne({id: req.params.item_id}).populate('cart')

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
    res.send(item)
  }))

  /**
   * @api {get} /api/item/:item_id Item
   * @apiDescription Gets an item by id, populating the options and added_by fields
   * @apiGroup Carts
   * @apiParam {String} :item_id
   */
  router.get('/item/:item_id', (req, res) => co(function * () {
    var item = yield db.Items.findOne({id: req.params.item_id})
      .populate('options')
      .populate('added_by', selectMembersWithoutEmail)
    res.send(item)
  }))


  /**
   * @api {get} /api/itempreview?q=:q Item Preview
   * @apiDescription Gets an item for a given url, ASIN, or search string, but does not add it to cart. Use 'post /api/cart/:cart_id/item {item_id: item_id}' to add to cart later.
   * @apiGroup Carts
   * @apiParam {String} :q either a url, asin, or search text
   * @apiParam {String} :page page of amazon search results
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
  router.get('/itempreview', (req, res) => co(function * () {
    // parse the incoming text to extract either an asin, url, or search query
    const q = (req.query.q || '').trim()
    if (!q) {
      throw new Error('must supply a query string parameter "q" which can be an asin, url, or search text')
    }

    if (q.includes('amazon.com')) {
      // probably a url
      var item = yield amazonScraper.scrapeUrl(q)
    } else if (q.match(/^B[\dA-Z]{9}|\d{9}(X|\d)$/)) {
      // probably an asin
      var item = yield amazonScraper.scrapeAsin(q)
    } else {
      // search query
      // throw new Error('only urls and asins supported right now sorry check back soon 감사합니다')
      var item = yield amazon.searchAmazon(q, req.query.page);
    }
    res.send(item)
  }))

  /**
   * @api {get} /api/cart/:cart_id/checkout Checkout
   * @apiDescription Does some upkeep on the back end (like locking items) and redirects to the amazon cart page
   * @apiGroup Carts
   * @apiParam {String} :cart_id the cart id
   */
  router.get('/cart/:cart_id/checkout', (req, res) => co(function * () {
    // get the cart
    var cart = yield db.Carts.findOne({id: req.params.cart_id}).populate('items')
    // logging.info('populated cart', cart);
    var cartItems = cart.items;

    if (cart.affiliate_checkout_url && cart.locked) {
      res.redirect(cart.affiliate_checkout_url)
    }

    // make sure the amazon cart is in sync with the cart in our database
    var amazonCart = yield amazon.syncAmazon(cart)

    //send receipt email
    logging.info('creating receipt...')
    var receipt = yield db.Emails.create({
      recipients: req.UserSession.user_account.email_address,
      sender: 'hello@kip.ai',
      subject: `Kip Receipt for ${cart.name}`,
      template_name: 'summary_email',
      unsubscribe_group_id: 2485
    });

    var userItems = {}; //organize items according to which user added them
    var items= []
    var users = []
    var total = 0;
    var totalItems = 0;
    cartItems.map(function (item) {
      if (!userItems[item.added_by]) userItems[item.added_by] = [];
      userItems[item.added_by].push(item);
      logging.info('item', item) //undefined
      totalItems += Number(item.quantity || 1);
      total += (Number(item.price) * Number(item.quantity || 1));
    });

    for (var k in userItems) {
      var addingUser = yield db.UserAccounts.findOne({id: k});
      users.push(addingUser.name || addingUser.email_address);
      items.push(userItems[k]);
    }

    yield receipt.template('summary_email', {
      username: req.UserSession.user_account.name || req.UserSession.user_account.email_address,
      baseUrl: 'http://' + (req.get('host') || 'mint-dev.kipthis.com'),
      id: cart.id,
      items: items,
      users: users,
      date: moment().format('dddd, MMMM Do, h:mm a'),
      total: '$' + total.toFixed(2),
      totalItems: totalItems,
      cart: cart
    })

    yield receipt.send();
    logging.info('receipt sent')

    // save the amazon purchase url
    if (cart.amazon_purchase_url !== amazonCart.PurchaseURL) {
      cart.amazon_purchase_url = amazonCart.PurchaseURL
      cart.affiliate_checkout_url = yield googl.shorten(`http://motorwaytoroswell.space/product/${encodeURIComponent(cart.amazon_purchase_url)}/id/mint/pid/shoppingcart`)
      yield cart.save()
    }
    // redirect to the cart url
    res.redirect(cart.affiliate_checkout_url)
  }))



  /**
   * @api {get} /api/item/:item_id/clickthrough Item Clickthrough
   * @apiDescription Logs metrics, adds our affiliate tag, and redirects to the amazon item detail page
   * @apiGroup Carts
   * @apiParam {String} :item_id the item id
   */
  router.get('/item/:item_id/clickthrough', (req, res) => co(function * () {
    // get the item
    var item = yield db.Items.findOne({id: req.params.item_id})

    // let amazon compose a nice link for us
    var amazonItem = yield amazon.lookupAmazonItem(item.asin)

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
   * @api {get} /api/cart_type list of carts sorted by location
   * @apiDescription Retrieves a list of carts sorted by IP location
   * @apiGroup Carts
   */
  router.get('/cart_type', (req, res) => co(function * () {
    // get customer IP
    var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    console.log('IP', ip)

    var ipresponse = yield ipinfo(ip);
    country = ipresponse.country;
    console.log('ipresponse', ipresponse)

    // send back list of stores in format on the git issue
    var stores = cart_types.filter(cart => cart.store_countries.indexOf(country) > -1);

    // if no exact match, use haversine thing
    res.send(stores)
  }))

  /**
   * @api {get} /api/categories gets a list of item categories
   * @apiDescription Retrieves a JSON of item categories -- currently just from a file for YPO
   * @apiGroup Carts
   */
  router.get('/categories', (req, res) => co(function * () {

    // read in categories file
    var categories = yield fs.readFile(path.join(__dirname, '../../ingest/categories.json'));
    categories = JSON.parse(categories.toString());
    categoryArray = [];

    //replace sub-categories w/ accumulated counts of all subcategories
    yield Object.keys(categories).map(function * (cat) {
      var categoryObject = {
        itemCount: 0,
        humanName: cat,
        machineName: cat,
        searchType: 'category'
      }

      var sampleItem = yield db.YpoInventoryItems.findOne({category_2: cat});

      categoryObject.image = sampleItem.image_url

      Object.keys(categories[cat]).map(c => {
        categoryObject.itemCount += Number(categories[cat][c]);
      })
      categoryArray.push(categoryObject)
    })
    console.log('categories:', categoryArray)
    res.send(categoryArray);
  }))
}
