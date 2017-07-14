const _ = require('lodash')
const logging = require('../../../logging.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

/**
 * split amount owned by split_type
 *
 * @type       {object} the invoice to use
 * @returns
 */
const userPaymentAmountHandler = {
  'split_equal': async (invoice) => {
    logging.info('even split')
    const cartId = (_.get(invoice, 'cart.id')) ? invoice.cart.id : invoice.cart
    const cart = await db.Carts.findOne({id: cartId}).populate('members')
    const debts = {}
    const perUser = invoice.total / (1.0 * cart.members.length)
    cart.members.map(function (user) {
      debts[user.id] = perUser
    })
    return debts
  },
  'split_single': (invoice) => {
    logging.info('single payer split')
    const debts = {}
    debts[invoice.leader.id] = invoice.total
    return debts
  },
  'split_by_item': async (invoice) => {
    logging.info('splitting by item')
    const cartId = (_.get(invoice, 'cart.id')) ? invoice.cart.id : invoice.cart
    const cart = await db.Carts.findOne({id: cartId}).populate('items')
    const debts = {}
    cart.items.map(item => {
      if (debts[item.added_by]) debts[item.added_by] += item.price * item.quantity
      else debts[item.added_by] = item.price * item.quantity
    })
    return debts
  }
}



/**
 * Sends an internal checkout email.
 *
 * @param      {<type>}   invoice  The invoice
 * @param      {<type>}   baseUrl  The base url
 * @return     {Promise}  { description_of_the_return_value }
 */
async function sendInternalCheckoutEmail (invoice, baseUrl) {
  logging.info('all payments complete')
  var paidEmail = await db.Emails.create({
    recipients: 'hello@kipthis.com',
    sender: 'hello@kipthis.com',
    subject: 'Payment Collected!',
    template_name: 'kip_order_process',
    cart: invoice.cart
  })

  var cart = await db.Carts.findOne({id: invoice.cart.id}).populate('items').populate('members').populate('leader')
  var itemsByUser = {}
  cart.items.map(function (item) {
    if (!itemsByUser[item.added_by]) itemsByUser[item.added_by] = [item]
    else itemsByUser[item.added_by].push(item)
  })
  var nestedItems = []
  Object.keys(itemsByUser).map(function (k) {
    nestedItems.push(itemsByUser[k])
  })

  var totalItems = cart.items.reduce(function (a, b) {
    return a + b.quantity
  }, 0)

  await paidEmail.template('kip_order_process', {
    username: cart.leader.name || cart.leader.email_address,
    baseUrl: baseUrl,
    id: cart.id,
    items: nestedItems,
    total: '$' + invoice.total.toFixed(2),
    cart: cart,
    totalItems: totalItems,
    date: paidEmail.sent_at,
    users: cart.members,
    checkoutUrl: cart.affiliate_checkout_url || 'www.kipthis.com'
    // address: cart.address
  })
  logging.info('sending checkout email to hello@kipthis.com')
  await paidEmail.send()
}

module.exports = {
  sendInternalCheckoutEmail: sendInternalCheckoutEmail,
  userPaymentAmountHandler: userPaymentAmountHandler
}
