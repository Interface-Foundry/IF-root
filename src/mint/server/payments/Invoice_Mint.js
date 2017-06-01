const _ = require('lodash')
const Invoice = require('./Invoice.js')

/**
 * Class for mint.
 *
 * @class      Mint (name)
 */

class MintInvoice extends Invoice {
  constructor(args) {
    super('mint')
    Object.assign(this, args)
  }

  static get name() {
    return 'mint'
  }

  async checkPrevInvoice () {
    const invoice = await db.Invoice.findOne({cart: this.cart})
    if (invoice) {
      return invoice
    }
    return null
  }

  /**
   * we dont need to actually create a charge but after a user checks out an
   * amazon cart we should note what items or whatever were in the cart at this point
   */
  get createAmazonCharge() {

  }

  // methods
}

module.exports = MintInvoice