const _ = require('lodash')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const userPaymentAmountHandler = {
  'split_equal': (invoice) => {
    logging.info('even split')
    const debts = {}
    const perUser = invoice.total / (1.0 * invoice.members.length)
    invoice.members.map(function (user) {
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
    const cartId = (_.get(invoice, 'cart.id')) ? invoice.cart.id : invoice.cart
    const cart = await db.Carts.findOne({id: cartId}).populate('items')
    const debts = {}
    cart.items.map(item => {
      if (debts[item.added_by]) debts[item.added_by] += item.price
      else debts[item.added_by] = item.price
    })
    return debts
  }
}

module.exports = {
  userPaymentAmountHandler: userPaymentAmountHandler
}