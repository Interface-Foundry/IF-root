const request = require('request-promise')
const _ = require('lodash')
const stripeTestID = 'sk_test_3dsHoF4cErzMfawpvrqVa9Mc'
const stripe = require('stripe')(stripeTestID)

const Invoice = require('./Invoice.js')
/**
 * Class for cafe invoice.
 *
 * @class      CafePayments (name)
 */
class CafeInvoice extends Invoice {
  constructor(payment) {
    super('cafe')
    this.payment = payment
  }

  static get name() {
    return 'cafe'
  }

  async newInvoice(paymentType, body) {
    const payment = await db.Invoice({
      invoice_type: this.invoice,
      payment_type: paymentType,
      cafe_order: body
    })
    return payment
  }

  // no idea but will be something like -- ANALAGOUS TO OLD chargeById
  async createStripeCharge (payment) {
    const responses = {}
    responses.stripe = await chargeStripe(payment)
    if (responses.stripe.status === 'succeeded') {
      responses.deliveryDotCom = await payDeliveryDotCom(payment)
    }
    await postBackToCafe(responses)
  }

  /**
   * synonymous with creating a charge
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async createInvoice (args) {
    const invoice = await db.Invoice.create({
      cart: this.cart,
      leader: this.leader
    })

    return invoice
  }

  /**
   * post back to cafe server to do all the previous stuff that was done in payments server
   *
   * @param      {<type>}   args    The arguments
   * @return     {Promise}  { description_of_the_return_value }
   */
  async postBackToSlack(args) {
    await request({
      uri: constant.SLACK.URI,
      method: 'POST',
      body: args
    })
  }
}

async function postBackToCafe(argument) {
  //body
}

async function chargeStripe(argument) {
  //body
}


async function payDeliveryDotCom(argument) {
  //body
}

async function stripeChargeById (payment) {
  const total = Math.round(payment.order.order.total)

  try {
    const charge = await stripe.charges.create({
      amount: total, // Amount in cents
      currency: 'usd',
      customer: payment.order.saved_card.customer_id, // Previously stored, then retrieved
      card: payment.order.saved_card.card_id
    })
  } catch (err) {
    logging.error('error creating stripe charge', err)
  }
  return charge
}