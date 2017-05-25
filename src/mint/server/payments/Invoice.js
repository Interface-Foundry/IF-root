const paymentUtils = require('./PaymentUtils.js')
const _ = require('lodash')

class Invoice {
  constructor(invoiceType, leader, cart) {
    this.invoice = invoiceType
    this.leader = leader
    this.cart = cart
  }

  async createInvoice () {
    const invoice = await db.Invoice.create({
      cart: this.cart,
      leader: this.leader
    })
  }

  async checkForInvoice () {
    const invoice = await db.Invoice.findOne({cart: this.cart})
    if (invoice) {
      return invoice
    }
    return null
  }

  createStripeCharge(args) {
    paymentUtils.stripeChargeById(args)
  }

}

/**
 * Class for cafe invoice.
 *
 * @class      CafePayments (name)
 */
class CafeInvoice extends Invoice {
  constructor(user, cart) {
    super('cafe', user, cart)
  }

  /**
   * Creates a new payment thats specific to
   *
   * @param      {<type>}  args    The arguments
   */
  async createInvoice(args) {
    //body
  }


  /**
   * post back to cafe server to do all the previous stuff that was done in payments server
   *
   * @param      {<type>}   args    The arguments
   * @return     {Promise}  { description_of_the_return_value }
   */
  async postBackToCafe(args) {

  }
}


/**
 * Class for mint.
 *
 * @class      Mint (name)
 */
class MintInvoice extends Invoice {
  constructor(user, cart) {
    super('mint', user, cart)
  }


  /**
   * we dont need to actually create a charge but after a user checks out an
   * amazon cart we should note what items or whatever were in the cart at this point
   */
  createAmazonCharge() {

  }

  // methods
}


MintInvoice.factoryName = 'mint'
CafeInvoice.factoryName = 'cafe'

module.exports = {
  MintInvoice: MintInvoice,
  CafeInvoice: CafeInvoice
}
