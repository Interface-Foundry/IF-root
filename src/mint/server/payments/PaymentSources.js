var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

class PaymentSource {
  constructor(paymentSource) {
    this.paymentSource = paymentSource
  }

  static async GetById (paymentSourceId) {
    const paymentSource = await db.PaymentSource({id: paymentSourceId})
    return new paymentSourceHandlers[paymentSource.source](paymentSource)
  }

  static async CreatePaymentSource (source, sourceData) {
    return new paymentSourceHandlers[source](sourceData)
  }
}


class StripePaymentSource extends PaymentSource {
  constructor(args) {
    super('stripe')
    Object.assign(this, args)
  }

  async add (stripeSource) {

  }
}


const paymentSourceHandlers = {
  [StripePaymentSource.name]: StripePaymentSource
}

module.exports = PaymentSource