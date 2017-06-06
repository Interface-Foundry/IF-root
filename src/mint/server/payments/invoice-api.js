const express = require('express')
const router = express()

const Invoice = require('./Invoice.js')
const PaymentSource = require('./PaymentSources.js')


// for mocha tests - check if server up
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', async (req, res) => {
    res.sendStatus(200)
  })
}

/**
 * @api {post} /invoice/:invoice_type/:cart_id create invoice
 * @apiDescription create an invoice for the specified cart
 * @apiGroup Invoice
 *
 * @apiParam {string} :invoice_type - description of param
 * @apiParam {string} :cart_id - cart id to lookup since we may have multiple systems
 */
router.post('/invoice/:invoice_type/:cart_id', async (req, res) => {
  const invoice = Invoice.Create(req.params.invoice_type, {cart: req.params.cart_id})
  const newInvoice = await invoice.createInvoice()
  return res.send(newInvoice)
})


// ------------------------------------
// ------- GENERAL ROUTES BELOW -------
// ------------------------------------

/**
 * main invoice route
 */
router.route('/invoice/:invoice_id')
/**
 * @api {get} /invoice/:invoice_id get
 * @apiDescription present a page relevant to invoice_id, allow entering payment details for stripe/etc.
 * @apiGroup Invoice
 *
 * @apiParam {string} :invoice_id - id of invoice
 */
  .get(async (req, res) => {
    const invoice = await Invoice.GetById(req.params.invoice_id)
    return res.send(invoice)
  })

  /**
  * @api {post} /invoice/:invoice_id post info to invoice
  * @apiDescription post info to an invoice, (info, emails, etc.), not payment stuff
   * @apiGroup Invoice
   *
   * @apiParam {string} :invoice_id - id of invoice
   */
  .post(async (req, res) => {
    const invoice = await Invoice.GetById(req.params.invoice_id)
    return res.send(invoice)
  })

/**
 * invoice routes related to payments for an invoice (collecting/getting payments,)
 */
router.route('/invoice/:invoice_id/payment')
  /**
   * @api {get} /invoice/:invoice_id/payment get/collect payments for invoice
   * @apiDescription collect payments for an invoice, either via email, alert, etc
   * @apiGroup Payments
   *
   * @apiParam {string} :invoice_id - invoice id
   * @apiParam {string} collection_metho (optional) - preference for how to bother users
   */
  .get(async (req, res) => {
    const collectionType = _.get(req, 'query.collection_method', 'email')
    const invoice = await Invoice.GetById(req.params.invoice_id)
    const paymentComplete = await invoice.paidInFull()
    if (paymentComplete) {
      return res.send(paymentComplete)
    }

    // ping users
    const paymentStatus = await invoice.collectPayments(collectionType)
    return res.send(paymentStatus)
  })


  /**
   * @api {post} /invoice/:invoice_id/payment post payment source to invoice
   * @apiDescription post a payment to an invoice
   * @apiGroup Payments
   *
   * @apiParam {string} :invoice_id - id of invoice to post payment to
   * @apiParam {string} payment_source - id of payment source we are using
   * @apiParam {number} payment_amount - amount of invoice to pay
   */
  .post(async (req, res) => {
    if (!_.get(req, 'body.payment_source')) {
      throw new Error('Need invoice id to post payment to')
    }
    if (!_.get(req, 'body.payment_amount')) {
      throw new Error('Need amount we are paying')
    }
    const invoice = await Invoice.GetById(req.params.invoice_id)
    const paymentSource = await PaymentSource.GetById(req.body.payment_source)
    const paymentAmount = req.body.payment_amount
    const payment = await paymentSource.pay(invoice, paymentAmount)
    return res.send(payment)
  })


/**
 * main payment route
 */
router.route('/payment/:user_id')
  /**
   * @api {get} /payment/:user_id get payment sources
   * @apiDescription get payment sources for a user (i.e. stripe, venmo, etc.)
   * @apiGroup PaymentSources
   *
   * @apiParam {string} :user_id - which user
   */
  .get(async (req, res) => {
    // need some check probably
  })

  /**
   * @api {post} /payment/:user_id create payment source for user_id
   * @apiDescription create a new payment source for a user
   * @apiGroup PaymentSources
   *
   * @apiParam {string} :user_id - which user
   * @apiParam {json} payment_info - whatever response from specific payment source
   */
  .post(async (req, res) => {
    if (!_.get(req, 'body.payment_info')) {
      throw new Error('need payment info')
    }
    const paymentSource = await PaymentSource.Create(req.body.payment_info)
    return res.send(paymentSource)
  })




module.exports = router
