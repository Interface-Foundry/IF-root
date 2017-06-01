const MintInvoice = require('./Invoice_Mint.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })


const invoiceHandlers = {
  [MintInvoice.name]: MintInvoice,
}

/**
 * Factory Class for Invoices to get/create/delete/etc.
 * Basically helper functions
 *
 * @class      InvoiceFactory (name)
 */
class InvoiceFactory {


  /**
   * Gets the Invoice by id
   *
   * @class      GetById (name)
   * @param      {string}   invoiceId  The invoice identifier
   * @return     {Promise}  The invoice db object into class object
   */
  static async GetById (invoiceId) {
    const invoice = await db.Invoice.findOne({id: invoiceId})
    if (!invoice) {
      throw new Error('no invoice found')
    }
    return new invoiceHandlers[invoice.invoice_type](invoice)
  }


  /**
   * create a new invoice of type with data
   *
   * @class      Create (name)
   * @param      {string}           invoiceType  The invoice type
   * @param      {object}           invoiceData  The invoice data
   * @return     {invoiceHandlers}  instantiation of the class
   */
  static Create (invoiceType, invoiceData) {
    return new invoiceHandlers[invoiceType](invoiceData)
  }
}



module.exports = InvoiceFactory