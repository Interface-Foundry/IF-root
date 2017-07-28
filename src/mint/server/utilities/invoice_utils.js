const _ = require('lodash')
const logging = require('../../../logging.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })


// If we want to add a fee, this is the basic idea of how we would do it.
// we will probably need to calculate it differently based on some attributes
// from invoice tho like store and shipping to/from
const KIP_PAY_FEE = 0

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
    const perUser = Math.round((invoice.total + KIP_PAY_FEE) / (1.0 * cart.members.length))
    cart.members.map(function (user) {
      debts[user.id] = perUser
    })
    return debts
  },
  'split_single': (invoice) => {
    logging.info('invoice', invoice)
    logging.info('single payer split')
    const debts = {}
    debts[invoice.leader.id] = invoice.total + KIP_PAY_FEE
    return debts
  },
  'split_by_item': async (invoice) => {
    logging.info('splitting by item')
    const cartId = (_.get(invoice, 'cart.id')) ? invoice.cart.id : invoice.cart
    const cart = await db.Carts.findOne({id: cartId}).populate('items').populate('members')
    const debts = {}
    // the fee kip charges
    const perUserFee = Math.round(KIP_PAY_FEE / cart.members.length)
    cart.items.map(item => {
      if (debts[item.added_by]) debts[item.added_by] += item.price * item.quantity
      else debts[item.added_by] = item.price * item.quantity + perUserFee
    })
    return debts
  }
}

async function paymentSourceTypes(invoice) {
  var cart = await db.Carts.findOne({id: invoice.cart.id}).populate('members')
  var payment_types = []
  for (var i = 0; i < cart.members.length; i++) {
    var payment = await db.Payments.findOne({
      user: cart.members[i].id,
      invoice: invoice.id
    }).populate('payment_source')
    // logging.info('PAYMENT', payment)
    if (payment) {
      payment_types.push(_.get(payment, 'payment_source.payment_vendor', 'stripe'))
    }
    else payment_types.push(null)
  }
  logging.info('payment types')
  return payment_types
}

/**
 * Sends an internal checkout email.
 *
 * @param      {<type>}   invoice  The invoice
 * @param      {<type>}   baseUrl  The base url
 * @return     {Promise}  { description_of_the_return_value }
 */
async function sendInternalCheckoutEmail (invoice, baseUrl, statusChange) {
  logging.info('all payments complete')
  const adminToEmail = (process.env.ADMIN_TO_EMAIL) ? process.env.ADMIN_TO_EMAIL : 'hello@kipthis.com'
  var paidEmail = await db.Emails.create({
    recipients: adminToEmail,
    sender: adminToEmail,
    subject: 'Payment Collected',
    template_name: 'kip_order_process',
    cart: invoice.cart
  })

  var cart = await db.Carts.findOne({id: invoice.cart.id}).populate('items').populate('members').populate('leader')
  var itemsByUser = {}
  for (var i = 0; i < cart.items.length; i++) {
    cart.items[i] = await db.Items.findOne({id: cart.items[i].id}).populate('price_conversion').populate('options')

    //construct string describing item options here instead of in html
    var option_string = cart.items[i].options.filter(op => op.selected)
    option_string = option_string.map(op => (op.type ? op.type.toUpperCase() + ': ' + op.name : op.name))
    option_string = option_string.join(', ')
    cart.items[i].option_string = option_string
  }
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

  const paymentSourceTypesArray = await paymentSourceTypes(invoice)

  const statusChangeUrl = `${baseUrl}/api/invoice/refund/${statusChange.id}/complete`
  logging.info('trying to send items', nestedItems)
  await paidEmail.template('kip_order_process', {
    username: cart.leader.name || cart.leader.email_address,
    baseUrl: baseUrl,
    statusChangeUrl: statusChangeUrl,
    id: cart.id,
    items: nestedItems.map(items => {
      return items.map(item => {
        item.price = item.price / 100
        logging.info('i t e m ', item)
        return item
      })
    }),
    total: '$' + (invoice.total / 100).toFixed(2),
    cart: cart,
    totalItems: totalItems,
    paymentSourceTypes: paymentSourceTypesArray,
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
