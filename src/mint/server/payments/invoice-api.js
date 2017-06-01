const express = require('express')
const router = express() // for testing
// const router = express.Router()

// const Invoice = require('./Invoice.js')
const invoiceFactory = require('./InvoiceFactory.js')




router.get('/test', async (req, res) => {
  res.sendStatus(200)
})

/**
 * @api {post} /invoice/:invoice_type/:cart_id
 * @apiDescription create an invoice for the
 * @apiGroup {Invoice}
 *
 * @apiParam {type} :invoice_type - description of param
 */
router.post('/:invoice_type/:cart_id', async (req, res) => {
  const invoice = await invoiceFactory(req.params.invoice_type, req.params.cart_id)
  const prevInvoice = await invoice.checkPrevInvoice()
  if (prevInvoice) {
    throw new Error('Previous invoice already created for this cart')
  }
  const newInvoice = await invoice.createNewInvoice()
  return newInvoice
})

/**
 * main route
 * e.g.
 *  mint -
 *    /invoice/adsfe222asdfasfasfad9dd4c012
 *  cafe -
 *    /invoice/58beasdf0af3c48b0f9f4ab41d84
 */
router.route('/:invoice_id')
  /**
   * @api {get} /:invoice_id
   * @apiDescription present a page relevant to invoice_id, allow entering payment details for stripe/etc.
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :param - description of param
   */
  .get(async (req, res) => {
    const invoice = invoiceFactory(req.params.invoice_id, 'get')
    return res.send(invoice.getData())
  })

  /**
  * @api {post} /:invoice_id
  * @apiDescription post a payment to an invoice
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :card_id - description of param
   */
  .post(async (req, res) => {
    const invoice = await invoiceFactory(req.params.invoice_id, 'get')
    const newCharge = await invoice.createNewCharge(req.body)
    return res.send(newCharge)
  })




// e.g. /cafe/stripe -> user is asking new card to be tied to account
router.post('/:invoice_type/new/:payment_type', async (req, res) => {
  const invoice = invoiceFactory(req.params.invoice_type)
  const newCharge = invoice.newInvoice(req.params.payment_type, req.body)
  // return res.send(newCharge)
})


// e.g. /cafe/stripe -> would be creating recurring charge for something like stripe
router.post('/:invoice_type/:payment_type', async (req, res) => {
  const invoice = invoiceFactory(req.params.invoice_type)
  let newCharge = await invoice.savedCard(req.params.payment_type, req.body)
  return res.send(newCharge)
})

module.exports = router
