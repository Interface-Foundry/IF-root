const Invoice = require('./Invoice.js')

const paymentHandlers = {
  [Invoice.MintInvoice.name]: Invoice.MintInvoice,
  [Invoice.CafeInvoice.name]: Invoice.CafeInvoice
}


function invoiceFactory (invoice, user, cart) {
  return new paymentHandlers[invoice](user, cart)
}

async function invoiceFromId(invoiceId) {
  const invoice = await db.Invoice.findOne({id: invoiceId})
  return invoice
}

module.exports = {
  invoiceFactory: invoiceFactory,
  invoiceFromId: invoiceFromId
}