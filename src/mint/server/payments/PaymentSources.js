var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const stripeConstants = {
  testId: 'sk_test_3dsHoF4cErzMfawpvrqVa9Mc',
  productionId: 'sk_live_LsboW21QfCziFnE1DwCKOC8d'
}

/**
  public keys to put into site for easy availability:
    - production: 'pk_live_0LCJqLkmMCFKYDwbPCrhQknH'
    - testing: 'pk_test_8bnLnE2e1Ch7pu87SmQfP8p7'
*/


const stripeSecret = (process.env.NODE_ENV !== 'production') ? stripeConstants.testId : stripeConstants.productionId

const _ = require('lodash')
const stripe = require('stripe')(stripeSecret)

class PaymentSource {
  constructor(paymentSource, args = {}) {
    this.paymentSource = paymentSource
  }

  static async GetById (paymentSourceId) {
    const paymentSource = await db.PaymentSource({id: paymentSourceId})
    return new paymentSourceHandlers[paymentSource.source](paymentSource)
  }

  static async Create (source, sourceData) {
    return new paymentSourceHandlers[source](sourceData)
  }
}


class StripePaymentSource extends PaymentSource {
  constructor(args) {
    super('stripe')
    Object.assign(this, args)
  }

  static get name() {
    return 'stripe'
  }

  async createPaymentSource (paymentInfo) {
    const user = await db.UserAccounts.findOne({id: this.user})

    const stripeResponse = await stripe.customers.create({
      email: user.email_address,
      // source: paymentInfo.token
    })

    const paymentSource = await db.PaymentSource.create({
      user: user.id,
      payment_vendor: 'stripe',
      data: stripeResponse
    })
    return paymentSource
  }
}


const paymentSourceHandlers = {
  [StripePaymentSource.name]: StripePaymentSource
}

module.exports = PaymentSource