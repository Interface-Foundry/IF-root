var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }


  /**
   * Creates an invoice.
   *
   * @return     {Promise}  returns the new object created in db
   */
  async createInvoice () {
    const cart = await db.Carts.findOne({id: this.cart})
    if (!cart) {
      throw new Error('Invoice needs to be attached to invoice')
    }
    const newInvoice = await db.Invoice.create({
      leader: cart.leader,
      invoice_type: this.invoice,
      cart: cart.id,
      paid: false,
      total: cart.subtotal
    })
    return newInvoice
  }
}

module.exports = Invoice