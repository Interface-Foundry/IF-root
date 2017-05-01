const co = require('co')
const _ = require('lodash')
const url = require('url')
var amazonScraper = require('../cart/scraper_amazon')
var amazon = require('../cart/amazon_cart')
var camel = require('../deals/deals');

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
      locked: false,
      or: [
        { leader: req.UserSession.user_account.id },
        { id: memberCartsIds }
      ]
    }).populate('items').populate('leader').populate('members')

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
   * @apiParam {String} :cart_id
   */
  router.get('/cart/:cart_id/items', (req, res) => co(function* () {
    var cart = yield db.Carts.findOne({ id: req.params.cart_id }).populate('items')
    if (!cart) {
      throw new Error('Cart not found')
    }

    res.send(cart.items)
  }));

  /**
   * @api {get} /api/sendgrid/cart/:cart_id/itemview/:user_id/:item_id
   */
  router.get('/sendgrid/cart/:cart_id/itemview/:user_id/:item_id', (req, res) => co(function * () {
    var item = yield db.Items.findOne({id: req.params.item_id});
    res.redirect(req.protocol + '://' + req.get('host') + `/cart/${req.params.cart_id}/m/item/0/${item.asin}`)
  }))

  /**
   * @api {get} /api/sendgrid/cart/:cart_id/item/:item_id
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

    // Can't update some fields with this route
    delete req.body.id
    delete req.body.leader
    delete req.body.items // need to go through post /api/cart/:cart_id/item route

    _.merge(cart, req.body)
    yield cart.save()
    res.send(cart)
  }))

  /**
    * @api {post} /api/share/:cart_id Send share cart email
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
      .populate('added_by')
    res.send(item)
  }))


  /**
   * @api {get} /api/itempreview?q=:q/ Item Preview
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

    // make sure the amazon cart is in sync with the cart in our database
    var amazonCart = yield amazon.syncAmazon(cart)

    // //send receipt email
    // logging.info('creating receipt...')
    // var receipt = yield db.Emails.create({
    //   recipients: req.UserSession.user_account.email_address,
    //   sender: 'hello@kip.ai',
    //   subject: 'Your Kip Order',
    //   template_name: 'receipt'
    // });
    //
    // var userItems = {}; //organize items according to which user added them
    // var items= []
    // var users = []
    // var total = 0;
    // cart.items.map(function (item) {
    //   if (!userItems[item.added_by]) userItems[item.added_by] = [];
    //   userItems[item.added_by].push(item);
    //   // logging.info('item', item) //undefined
    //   total += Number(item.price);
    // });
    //
    // for (var k in userItems) {
    //   var addingUser = yield db.UserAccounts.findOne({id: k});
    //   users.push(addingUser.email_address.toUpperCase());
    //   items.push(userItems[k]);
    // }
    //
    // yield receipt.template('receipt', {
    //   baseUrl: process.env.BASEURL || 'http://mint-dev.kipthis.com',
    //   id: cart.id,
    //   items: items,
    //   users: users,
    //   total: total
    // })
    //
    // yield receipt.send();
    // logging.info('receipt sent')

    // redirect to the cart url
    res.redirect(amazonCart.PurchaseURL)
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
    res.redirect(amazonItem.Item.DetailPageURL)
  }))


}
