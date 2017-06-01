const Invoice = require('./Invoice.js')

/**
 * Class for mint.
 *
 * @class      Mint (name)
 */

class MintInvoice extends Invoice {
  constructor(cart) {
    super('mint')
    this.cart = cart
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

  async createInvoice() {
    const cart = await db.Cart({id: this.cart})
    const newInvoice = await db.Invoice.create({
      leader: cart.leader,
      invoice_type: 'mint',
      cart: cart.id,
      paid: false,
      total: cart.subtotal
    })
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