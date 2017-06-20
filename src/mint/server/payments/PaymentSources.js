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
    // logging.info('paymentSourceId', paymentSourceId)
    const paymentSource = await db.PaymentSources.findOne({id: paymentSourceId})
    // logging.info('paymentSource', paymentSource)
    return new paymentSourceHandlers[paymentSource.payment_vendor](paymentSource)
  }

  static async Create (source, sourceData) {
    return new paymentSourceHandlers[source](sourceData)
  }

  // //this is #fakenews -- for testing
  // async pay (invoice, amount) {
  //   logging.info('pay called')
  //   //create payments
  //   // logging.info('this', this)
  //   var payment = await db.Payments.create({
  //     invoice: invoice.id,
  //     user: this.user,
  //     payment_source: this.id,
  //     amount: amount
  //   })
  //   logging.info('got the payment')
  //   return payment;
  // }
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
      source: paymentInfo.token //was commented out? intentionally? who knows
    })

    const paymentSource = await db.PaymentSources.create({
      user: user.id,
      payment_vendor: 'stripe',
      data: stripeResponse
    })
    return paymentSource
  }

  async pay (invoice, amount) {
    // commented out for testing purposes

    // const stripeResponse = await stripe.charges.create({
    //   amount: amount,
    //   currency: _.get(invoice, 'currency', 'usd'),
    //   source: this.data.id
    // })
    var stripeResponse = {}

    const payment = await db.Payments.create({
      invoice: invoice.id,
      user: this.user,
      payment_source: this.id,
      amount: amount,
      data: stripeResponse
    })

    return payment
  }
}


const paymentSourceHandlers = {
  [StripePaymentSource.name]: StripePaymentSource
}

module.exports = PaymentSource
