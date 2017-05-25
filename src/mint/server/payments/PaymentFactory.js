const Payment = require('./Payment.js')

const paymentHandlers = {
  [Payment.MintPayment.factoryName]: Payment.MintPayment,
  [Payment.CafePayment.factoryName]: Payment.CafePayment
}


function GetPayment (invoice, user, cart) {
  return new paymentHandlers[invoice](user, cart)
}
