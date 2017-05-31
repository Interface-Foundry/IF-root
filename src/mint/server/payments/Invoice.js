const constant = require('./payment_constants.js')

export default class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }
}
