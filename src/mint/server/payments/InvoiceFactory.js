const Invoice = require('./Invoice.js')

const paymentHandlers = {
  [Invoice.MintInvoice.factoryName]: Invoice.MintInvoice,
  [Invoice.CafeInvoice.factoryName]: Invoice.CafeInvoice
}


function GetInvoice (invoice, user, cart) {
  return new paymentHandlers[invoice](user, cart)
}
