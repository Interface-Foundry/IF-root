var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const stripeConstants = {
  testId: 'sk_test_3dsHoF4cErzMfawpvrqVa9Mc',
  productionId: 'sk_live_LsboW21QfCziFnE1DwCKOC8d'
}

const paypalConstants = {
  // probably should sign up for real one but using
  // sandbox_account: graham.annett-facilitator@gmail.com
  sandbox: {
    'client_id': 'AW4Qaa3xF5SKI1Ysz6kTkFWq0c7AGBtpUXlJEkkO8SMhMO5Kn--MiEjVvhG6fwTkj0cuhTbmJMlF7_om',
    'secret': 'ENb66BTZvmHDCWW7dLvH-bjfQOgTHXKOmRgqxhQQj6OGE2VDh4bLrd3lguyu0lgwaDcq2sc3swMw1RXM'
  },
  live: {
    'client_id': 'AVr0hZHU5vDLj1MVHlVchyeDCOrcmFPCT2pxv3A0zLjntjmiwT4wP-pH1K92jwlShkZj5IDYX08FYfbX',
    'secret': 'EP_RKjhxgdqrCDFlPzngORDECznYGTYdgzV0IyivLdiD5B6Hp22OJ5oniv5O3IZUjdEqra4o_thsz5tV'
  },
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


const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox',
  'client_id': paypalConstants.sandbox.client_id,
  'client_secret': paypalConstants.sandbox.client_secret
});


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

  static async CreatePaymentWithoutSource(paymentSource, userId, invoiceId, amount, data) {

    const payment = await db.Payments.create({
      user: userId,
      invoice: invoiceId,
      amount: parseInt(amount),
      payment_vendor: paymentSource,
      data: data
    })

    return payment
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
    if (_.get(paymentsOnThisInvoice, 'data')) {
      logging.info('user has already paid')
      paymentStatus.paid = true
      paymentStatus.amount = paymentsOnThisInvoice.amount
      paymentStatus.payment_id = paymentsOnThisInvoice.id
      return paymentStatus
    }
    logging.info('total would be', invoice.total)
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

    const paymentVendor = _.get(payment, 'payment_source.payment_vendor') ? payment.payment_source.payment_vendor : payment.payment_vendor
    logging.info('using payment.payment_vendor', paymentVendor)

    logging.info('checking if invoice can be refunded:', payment.invoice.refund_ability)
    if (payment.invoice.refund_ability === false) {
      throw new Error('Cant refund when refund_ability === false')
    }

    const PaymentSourceClass = paymentSourceHandlers[paymentVendor]
    const refund = {
      refund: await PaymentSourceClass.refundPayment(payment),
      invoice: payment.invoice
    }

    return refund
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


/**
 * Class for stripe payment source.
 *
 * @class      StripePaymentSource (name)
 */
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

/**
 * Class for paypal payment source.
 * notes:
 *  https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4/advanced-payments-api/create-express-checkout-payments/
 * @class      PaypalPaymentSource (name)
 */
class PaypalPaymentSource extends PaymentSource {

  constructor(args) {
    super('paypal')
    Object.assign(this, args)
  }

  static get name() {
    return 'paypal'
  }

  static async refundPayment (payment) {
    logging.info('refunding paypal payment')

    const adminToEmail = (process.env.ADMIN_TO_EMAIL) ? process.env.ADMIN_TO_EMAIL : 'hello@kipthis.com'
    const email = await db.Emails.create({
      recipients: adminToEmail,
        subject: 'Need to manually refund a paypal payment',
        template_name: 'kip_paypal_refund'
      })

      await email.template(email.template_name, {
        paymentId: payment.id,
        amount: payment.amount / 100,
        invoiceId: payment.invoice.id
      })

      await email.send();
  }

  // need to do these for paypal stuff
  async createPaymentSource (paymentInfo) {
    //todo
  }

  async pay (invoice) {
    //todo
  }
}

const paymentSourceHandlers = {
  [StripePaymentSource.name]: StripePaymentSource,
  [PaypalPaymentSource.name]: PaypalPaymentSource
}

module.exports = PaymentSource
