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

const testStripeSecret = 'sk_test_3dsHoF4cErzMfawpvrqVa9Mc'
const stripeSecret = process.env.STRIPE_SECRET || testStripeSecret

const _ = require('lodash')
const stripe = require('stripe')(stripeSecret)
const userPaymentAmountHandler = require('../utilities/invoice_utils').userPaymentAmountHandler


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

  static async GetByInvoiceId (invoiceId) {
    const payments = await db.Payments.find({invoice: invoiceId})
    return payments
  }


  /**
   * create the payment objects that we update once a user has submitted payment/cancelled etc.
   *
   * @class      CreateInitialPayments (name)
   * @param      {invoice}   invoice  The invoice
   * @return     {Promise}  { description_of_the_return_value }
   */
  static async GetPaymentStatus(userId, invoiceId) {
    const invoice = await db.Invoices.findOne({id: invoiceId}).populate('leader').populate('cart')
    const paymentsOnThisInvoice = await db.Payments.findOne({user: userId, invoice: invoice.id})

    // object to return
    const paymentStatus = {
      paid: false,
      amount: 0
    }

    // check if user has already paid
    if (_.get(paymentsOnThisInvoice, 'status') === 'success') {
      logging.info('user has already paid')
      paymentStatus.paid = true
      paymentStatus.amount = paymentsOnThisInvoice.amount
      return paymentStatus
    }
    const debts = await userPaymentAmountHandler[invoice.split_type](invoice)
    logging.info('got debts', JSON.stringify(debts))
    paymentStatus.amount = debts[userId]
    return paymentStatus
  }

  static async Create (source, sourceData) {
    return new paymentSourceHandlers[source](sourceData)
  }

  static async GetForUserId (userId) {
    const paymentSources = await db.PaymentSources.find({user: userId})
    const sourcesArray = paymentSources.map(source => {
      if (source.payment_vendor === 'stripe') {
        return {
          id: source.id,
          last4: source.data.sources.data[0].last4,
          brand: source.data.sources.data[0].brand,
          exp_month: source.data.sources.data[0].exp_month,
          exp_year: source.data.sources.data[0].exp_year
        }
      }
    })
    return sourcesArray
  }


  /**
   * refund a payment by PaymentId
   *
   * @class      RefundPaymentId (name)
   * @param      {<type>}   paymentId  The payment identifier
   * @return     {Promise}  { description_of_the_return_value }
   */
  static async RefundPaymentId (paymentId) {
    const payment = await db.Payments.findOne({id: paymentId}).populate('payment_source').populate('invoice')
    logging.info('using payment.payment_source.payment_vendor',  payment.payment_source.payment_vendor)

    logging.info('checking if invoice can be refunded:', payment.invoice.refund_status)
    if (payment.invoice.refund_status === false) {
      throw new Error('Cant refund when refund_status === false')
    }

    const PaymentSourceClass = paymentSourceHandlers[payment.payment_source.payment_vendor]
    PaymentSourceClass.refundPayment(payment)

    return
  }

  static async DeletePaymentSource(userId, paymentsourceId) {
    const paymentSource = await db.PaymentSources.findOne({id: paymentsourceId})
    if (paymentSource.user !== userId) {
      logging.info('userid', userId)
      logging.info('paymentSource', paymentSource)
      throw new Error('Can only delete Payment Source if payment_source.user is same as userId')
    }
    await paymentSource.archive()
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
      source: paymentInfo.id
    })

    const paymentSource = await db.PaymentSources.create({
      user: user.id,
      source: paymentInfo,
      payment_vendor: 'stripe',
      data: stripeResponse
    })

    return paymentSource
  }

  async pay (invoice) {

    const debts = await userPaymentAmountHandler[invoice.split_type](invoice)
    logging.info('userId', this.user)
    const paymentAmount = debts[this.user]

    const stripeResponse = await stripe.charges.create({
      amount: paymentAmount,
      currency: 'usd',
      customer: this.data.id
    })

    logging.info('got stripe response', stripeResponse)

    const payment = await db.Payments.create({
      invoice: invoice.id,
      user: this.user,
      payment_source: this.id,
      amount: paymentAmount,
      data: stripeResponse
    })

    return payment
  }

  static async refundPayment (payment) {
    logging.info('in stripe refund', payment)
    const refund = stripe.refunds.create({
      charge: payment.data.id
    })

    payment.refund = refund
    await payment.save()
    await payment.archive()

    return refund
  }
}

const paymentSourceHandlers = {
  [StripePaymentSource.name]: StripePaymentSource
}

module.exports = PaymentSource
