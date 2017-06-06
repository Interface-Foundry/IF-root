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


/**
 * @api {post} /invoice/:invoice_id/payment use payment source on invoice
 * @apiDescription post a payment to an invoice
 * @apiGroup Invoice
 *
 * @apiParam {string} :invoice_id - id of invoice to post payment to
 * @apiParam {string} payment_source - id of payment source we are using
 * @apiParam {number} payment_amount - amount of invoice to pay
 */
router.post('/invoice/:invoice_id/payment', async (req, res) => {
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
 * @apiParam {type} :param - description of param
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
   * @apiParam {type} :invoice_id - id of invoice you are posting to
   */
  .post(async (req, res) => {
    const invoice = await Invoice.GetById(req.params.invoice_id)
    return res.send(invoice)
  })


/**
 * main payment route
 */
router.route('/payment')
  /**
   * @api {post} /payment create payment source
   * @apiDescription create a new payment source
   * @apiGroup PaymentSources
   *
   */
  .post(async (req, res) => {
    if (!_.get(req, 'body.payment_info')) {
      throw new Error('need payment info')
    }
    const paymentSource = await PaymentSource.Create(req.body.payment_info)
    return res.send(paymentSource)
  })




module.exports = router
