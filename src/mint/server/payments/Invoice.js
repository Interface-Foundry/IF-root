const constant = require('./payment_constants.js')

class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }
}

module.exports = Invoice