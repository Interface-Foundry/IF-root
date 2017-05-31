const Invoice = require('./Invoice.js')

const paymentHandlers = {
  [Invoice.MintInvoice.name]: Invoice.MintInvoice,
  [Invoice.CafeInvoice.name]: Invoice.CafeInvoice
}


// lookup an invoice
async function invoiceFromId(invoiceId) {
  const invoice = await db.Invoice.findOne({id: invoiceId})
  return invoice
}

// allow for invoice factory to do something other than instantiate invoice object
const actionMap = {
  'get': invoiceFromId
}

async function invoiceFactory (invoiceData, action) {
  if (action === 'create' || action === undefined) {
    return new paymentHandlers[invoiceData]()
  }

  const result = await actionMap[action](invoiceData)
  return result
}



module.exports = invoiceFactory