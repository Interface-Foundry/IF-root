const _ = require('lodash')
const request = require('request-promise')

const constant = require('./payment_constants.js')
const invoiceUtils = require('./InvoiceUtils.js')

class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }

  async checkForInvoice () {
    const invoice = await db.Invoice.findOne({cart: this.cart})
    if (invoice) {
      return invoice
    }
    return null
  }


}

/**
 * Class for cafe invoice.
 *
 * @class      CafePayments (name)
 */
class CafeInvoice extends Invoice {
  constructor(payment) {
    super('cafe')
    this.payment = payment
  }

  static get name() {
    return 'cafe'
  }

  // async getDeliveryObject (cart) {
  //   const req = await request({
  //     uri: constant.CAFE.URI,
  //     method: 'GET',

  //   })
  // }


  async createStripeCharge (args) {

  }

  /**
   * synonymous with creating a charge
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async createInvoice (args) {
    const invoice = await db.Invoice.create({
      cart: this.cart,
      leader: this.leader
    })

    return invoice
  }

  /**
   * post back to cafe server to do all the previous stuff that was done in payments server
   *
   * @param      {<type>}   args    The arguments
   * @return     {Promise}  { description_of_the_return_value }
   */
  async postBackToCafe(args) {
    await request({
      uri: constant.CAFE.URI,
      method: 'POST',
      body: args
    })
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

  static get name() {
    return 'mint'
  }


  /**
   * we dont need to actually create a charge but after a user checks out an
   * amazon cart we should note what items or whatever were in the cart at this point
   */
  get createAmazonCharge() {

  }

  // methods
}

module.exports = {
  MintInvoice: MintInvoice,
  CafeInvoice: CafeInvoice
}
