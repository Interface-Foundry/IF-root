const paymentUtils = require('./PaymentUtils.js')
const _ = require('lodash')

class Payment {
  constructor(invoiceType, user, cart) {
    this.invoice = invoiceType
    this.user = user
    this.cart = cart
  }

  async createPaymentDb () {
    const payment = await db.Payment.create({
      type
    })
  }

  sayHello(args) {
    console.log('hey', args)
    return args + 'XXX'
  }

  createStripeCharge(args) {
    paymentUtils.stripeChargeById(args)
  }

}

/**
 * Class for cafe payments.
 *
 * @class      CafePayments (name)
 */
class CafePayment extends Payment {
  constructor(user, cart) {
    super('cafe', user, cart)
  }

  /**
   * Creates a new payment.
   *
   * @param      {<type>}  args    The arguments
   */
  createNewPayment(args) {
    //body
  }

  postBackToCafe(args) {

  }
}


/**
 * Class for mint.
 *
 * @class      Mint (name)
 */
class MintPayment extends Payment {
  constructor(user, cart) {
    super('mint', user, cart)
  }

  createPaymentInDb() {

  }

  // methods
}


MintPayment.factoryName = 'mint'
CafePayment.factoryName = 'cafe'

module.exports = {
  MintPayment: MintPayment,
  CafePayment: CafePayment
}
