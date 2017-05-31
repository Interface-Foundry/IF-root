const Invoice = require('./Invoice.js')

const paymentHandlers = {
  [Invoice.MintInvoice.name]: Invoice.MintInvoice,
  [Invoice.CafeInvoice.name]: Invoice.CafeInvoice
}


module.exports.invoiceFactory = function invoiceFactory (invoice, user, cart) {
  return new paymentHandlers[invoice](user, cart)
}


var s = module.exports.invoiceFactory('mint', 'asdf', 'ca1')

console.log(s.cart)