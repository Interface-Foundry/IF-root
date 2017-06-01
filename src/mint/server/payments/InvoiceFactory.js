const MintInvoice = require('./Invoice_Mint.js')

const invoiceHandlers = {
  [MintInvoice.name]: MintInvoice,
}

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })


/**
 * Factory Class for Invoices
 *
 * @class      InvoiceFactory (name)
 */
class InvoiceFactory {
  static async GetById (invoiceId) {
    const invoice = await db.Invoice.findOne({id: invoiceId})
    if (!invoice) {
      throw new Error('no invoice found')
    }
    return new invoiceHandlers[invoice.invoice_type](invoice)
  }

  static Create (invoiceType, invoiceData) {
    return new invoiceHandlers[invoiceType](invoiceData)
  }
}



module.exports = InvoiceFactory