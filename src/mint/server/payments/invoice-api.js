const express = require('express')
const router = express() // for testing
// const router = express.Router()

const InvoiceFactory = require('./InvoiceFactory.js')


// for mocha tests - check if server up
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', async (req, res) => {
    res.sendStatus(200)
  })
}

/**
 * @api {post} /invoice/:invoice_type/:cart_id
 * @apiDescription create an invoice for the
 * @apiGroup {Invoice}
 *
 * @apiParam {type} :invoice_type - description of param
 */
router.post('/invoice/:invoice_type/:cart_id', async (req, res) => {
  const invoice = InvoiceFactory.Create(req.params.invoice_type, {cart: req.params.cart_id})
  const newInvoice = await invoice.createInvoice()
  return res.send(newInvoice)
})




/**
 * @api {post} /payment/:invoice_type/:payment_type
 * @apiDescription
 * @apiGroup {Payments}
 *
 * @apiParam {type} :invoice_type - mint, cafe, etc
 * @apiParam {type} :payment_type - stripe, etc
 */
router.post('/payment/:invoice_type/:payment_type', async (req, res) => {
  const invoice = InvoiceFactory.Create(req.params.invoice_type)
  const newCharge = invoice.newInvoice(req.params.payment_type, req.body)
  return res.send(newCharge)
})



/**
 * @api {post} /{route}/:param
 * @apiDescription description of the route
 * @apiGroup {GROUP}
 *
 * @apiParam {type} :param - description of param
 */
router.post('/payment/:invoice_id/:payment_id', async (req, res) => {
  const invoice = InvoiceFactory(req.params.invoice_type)
  let newCharge = await invoice.savedCard(req.params.payment_type, req.body)
  return res.send(newCharge)
})


/**
 * main route
 * /:invoice_id
 */
router.route('/invoice/:invoice_id')
  /**
   * @api {get} /:invoice_id
   * @apiDescription present a page relevant to invoice_id, allow entering payment details for stripe/etc.
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :param - description of param
   */
  .get(async (req, res) => {
    const invoice = await InvoiceFactory.GetById(req.params.invoice_id)
    return res.send(invoice)
  })

  /**
  * @api {post} /:invoice_id
  * @apiDescription post a payment to an invoice
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :card_id - description of param
   */
  .post(async (req, res) => {
    const invoice = await InvoiceFactory.GetById(req.params.invoice_id)
    return res.send(invoice)
  })

module.exports = router
