const MintInvoice = require('./Invoice_Mint.js')

const paymentHandlers = {
  [MintInvoice.name]: MintInvoice,
}

async function invoiceFactory (invoiceType, invoiceData) {
  return new paymentHandlers[invoiceType](invoiceData)
}



module.exports = invoiceFactory