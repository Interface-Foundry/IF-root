const _ = require('lodash');
const express = require('express')
const router = express() // for testing
// const router = express.Router()

// const Invoice = require('./Invoice.js')
const invoiceFactory = require('./InvoiceFactory.js')


/**
 * @api {post} /cafe/new
 * @apiDescription need to send to page where user can enter card details and posts to stripe
 * @apiGroup payments
 *
 * @apiParam {type} new - description of param
 */
router.get('/cafe/:invoice_id', async (req, res) => {
  const invoice = invoiceFactory('cafe', )
})


/**
 * @api {post} /cafe/new
 * @apiDescription need to send to page where user can enter card details and posts to stripe
 * @apiGroup payments
 *
 * @apiParam {type} new - description of param
 */
router.post('/cafe/new', async (req, res) => {
  const invoice = invoiceFactory('cafe', req.body)
  return res.send(invoice.newCharge())
})

/**
 * @api {get} /cafe/:param
 * @apiDescription charge a presaved card
 * @apiGroup {GROUP}
 *
 * @apiParam {type} :param - description of param
 */
router.post('/cafe/saved', async (req, res) => {
  const invoice = invoiceFactory('cafe', )
  const results = await invoice.charge()
  return res.send(results)
})

/**
 * main route
 * e.g.
 *  mint -
 *    /invoice/mint/e2229dd4c012
 *  cafe -
 *    /invoice/cafe/58be0af3c48b0f9f4ab41d84
 */
router.route('/:invoice/:cart_id')
  /**
   * @api {get} /:invoice
   * @apiDescription description of the route
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :param - description of param
   */
  .get(async (req, res) => {
    const invoice = invoiceFactory(req.params.invoice)
    return res.send(invoice.getInvoice)
  })
  /**
  * @api {post} /:invoice/:cart_id
  * @apiDescription create new invoice
   * @apiGroup {GROUP}
   *
   * @apiParam {type} :card_id - description of param
   */
  .post(async (req, res) => {
    const invoice = invoiceFactory(req.params.invoice_type)
    const newCharge = await invoice.createNewCharge(req.body)
    return res.send(newCharge)
  })




/**
 * @api            {get}  /pay/:cart_id/:user_id
 * @apiName        get payment info
 * @apiGroup       Payments
 *
 * @apiDescription Gets the user payment options for the specified cart.
 *
 * @apiParam       {string}  cart_id      {description}
 * @apiParam       {string}  user_id      {description}
 *
 * @apiSuccess                                 <field>
 */
router.get('/pay/:cart_id/:user_id', async (req, res) => {
  const payment = (req.params.cart_id, req.params.user_id)
})


/**
 * @api {post} /charge/:cart_type
 * @apiDescription create charge or something
 * @apiGroup Payments
 *
 * @apiParam {string} :cart_type - description of param
 */
router.post('/charge/:cart_type/:id', async (req, res) => {
  await chargeHandlers[req.params.type](req.body)
})


// remove later
const PORT = process.env.PORT || 3000;

router.listen(PORT, () => {
  console.log(`App listening at http://127.0.0.1:${PORT}`);
});



// router.post('/process', (req, res) => co(function * () {
// }))