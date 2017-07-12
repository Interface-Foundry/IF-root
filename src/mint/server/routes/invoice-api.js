const _ = require('lodash')

const Invoice = require('../payments/Invoice.js')
const Cart = require('../cart/Cart.js')
const PaymentSource = require('../payments/PaymentSources.js')
const utils = require('../utilities/invoice_utils.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

module.exports = function (router) {

  // ------------------------------------
  // --------- GENERAL ROUTES  ----------
  // ------------------------------------

  router.get('/invoice/test/:id', async (req, res) => {
    let cart = await Cart.GetById(req.params.id)
    res.send(cart)
  })

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
      let invoice
      try {
        invoice = await Invoice.GetById(req.params.invoice_id)
      } catch (err) {
        logging.info('error getting invoice, possibly not available', err)
        return res.send(500)
      }
      return res.send(invoice)
    })

    /**
    * @api {post} /invoice/:invoice_id post info to invoice
    * @apiDescription post info to an invoice, (info, emails, etc.), not payment stuff
     * @apiGroup Invoice
     *
     * @apiParam {string} :invoice_id - id of invoice
     * @apiParam {string} option - type of thing we are doing
     */
    .post(async (req, res) => {
      const invoice = await Invoice.GetById(req.params.invoice_id)
      if (_.get(req, 'body.action')) {
        await invoice.doAction(req.body.action)
      }
      return res.send(invoice)
    })

    /**
     * @api {put} /invoice/:invoice_id
     * @apiDescription update options related to an invoice
     * @apiGroup Invoice
     *
     * @apiParam {string} :invoice_id - the invoice id
     * @apiParam {string} option_chage - the option we are updating (pay type)
     * @apiParam {object} option_data - the options to change stuff to
     */
    .put(async (req, res) => {
      logging.info('got req to update or action', req.body)
      let invoice
      if (_.get(req, 'body.option_change')) {
        logging.info(`updating option for invoice ${req.params.invoice_id}: ${req.body.option_change} with ${req.body.option_data}`)
        invoice = await Invoice.optionUpdate(req.params.invoice_id, req.body.option_change, req.body.option_data)
      }

      return res.send(invoice)
    })

  /**
   * invoice routes related to payments for an invoice (collecting/getting payments,)
   */



  router.route('/invoice/payment/:invoice_id')
  /**
  * @api {post} /invoice/payment/:invoice_id
  * @apiDescription create the payment objects to be used with paymentsources for an invoice
  * @apiGroup Payments
  *
  * @apiParam {string} :invoice_id - invoice id
  */
    .get(async (req, res) => {
      logging.info('getting user payment status')
      logging.info('req.user', req.UserSession.user_account.id)
      const userId = req.UserSession.user_account.id
      const invoiceId = req.params.invoice_id
      const paymentObject = await PaymentSource.GetPaymentStatus(userId, invoiceId)
      logging.info('paymentsObject for user:', paymentObject)
      return res.send(paymentObject)
    })

  /**
  * @api {put} /invoice/payment/:invoice_id post payment source to invoice
  * @apiDescription post a payment to an invoice
  * @apiGroup Payments
  *
  * @apiParam {string} :invoice_id - id of invoice to post payment to
  * @apiParam {string} payment_source - id of payment source we are using
  * @apiParam {number} payment_amount - amount of invoice to pay
  */
    .post(async (req, res) => {
      logging.info('posted to payment route')
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
      logging.info('paid')

      // If this invoice has been fully paid, fire off whatever emails
      var done = await invoice.paidInFull()
      if (done) {
        await utils.sendInternalCheckoutEmail(invoice, 'http://' + (req.get('host') || 'mint-dev.kipthis.com'))
      }

      return res.send(payment)
    })

  /**
  * @api {put} /invoice/payment/:invoice_id get/collect payments for invoice
  * @apiDescription collect payments for an invoice, either via email, alert, etc
  * @apiGroup Payments
  *
  * @apiParam {string} :invoice_id - invoice id
  * @apiParam {string} collection_metho (optional) - preference for how to bother users
  */
    .put(async (req, res) => {
      logging.info('get payment called')
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
   * main ticket system route
   */
  router.route('/invoice/ticket')
    /**
     * @api {get} /invoice/ticket
     * @apiDescription get all the invoices that need something or of specified type
     * @apiGroup {GROUP}
     *
     * @apiParam {string} type (optional) - description of param
     */
    .get(async (req, res) => {
      if (req.body.type) {
        return await db.Invoices.find({status: req.body.type})
      }
      const invoices = await db.Invoices.find({
        status: { '!' : 'done' }
      })
      return res.send(invoices)
    })

    /**
    * @api {get} /invoice/ticket
    * @apiDescription update invoice status
    * @apiGroup Invoice
    *
    * @apiParam {string} invoice_id - invoice_id to use
    * @apiParam {string} new_status - new_status to change to
    */
    .post(async (req, res) => {
      const invoice_id = req.body.invoice_id
      const newStatus = req.body.new_status

      const invoice = await db.Invoices.findOne({id: invoice_id})
      invoice.status = newStatus
      await invoice.save()
      return res.send(invoice)
    })


  /**
   * main payment route
   */
  router.route('/payment')
    /**
     * @api {get} /payment get payment sources
     * @apiDescription get payment sources for a user (i.e. stripe, venmo, etc.)
     * @apiGroup PaymentSources
     *
     * @apiParam {string} :user_id - which user
     */
    .get(async (req, res) => {
      const userId = req.UserSession.user_account.id
      const paymentSources = await PaymentSource.GetForUserId(userId)
      logging.info('got user payment sources', paymentSources)
      return res.send(paymentSources)
    })

    /**
     * @api {post} /payment create payment source for user_id
     * @apiDescription create a new payment source for a user
     * @apiGroup PaymentSources
     *
     * @apiParam {string} :user_id - which user
     * @apiParam {string} body.payment_source - which type of payment source we are creating
     * @apiParam {json} payment_info - whatever response from specific payment source
     */
    .post(async (req, res) => {
      const userId = req.UserSession.user_account.id
      const paymentSourceType = _.get(req, 'body.payment_source', 'stripe')
      const paymentSource = await PaymentSource.Create(paymentSourceType, {user: userId})
      const createdSource = await paymentSource.createPaymentSource(req.body.payment_data)
      logging.info('new payment source:', createdSource)
      const paymentSources = await PaymentSource.GetForUserId(userId)
      return res.send(paymentSources)
    })

  router.route('/payment/:paymentsource_id')
    /**
     * @api {post} /payment/:paymentsource_id
     * @apiDescription create a payment for an invoice
     * @apiGroup PaymentSources
     *
     * @apiParam {string} :paymentsource_id - id of payment source
     * @apiParam {string} :invoice_id - id of invoice
     *
    */
    .post(async (req, res) => {
      const userId = req.UserSession.user_account.id
      const paymentSourceId = req.params.paymentsource_id
      const paymentSource = await PaymentSource.GetById(paymentSourceId)

      if (paymentSource.user !== userId) {
        throw new Error('UserId and paymentSource user must match')
      }

      const invoice = await Invoice.GetById(req.body.invoice_id)

      const payment = await paymentSource.pay(invoice)
      logging.info('paid', payment)
      return res.send(payment)
    })
    /**
     * @api {delete} /payment/:paymentsource_id
     * @apiDescription delete the paymentsource
     * @apiGroup PaymentSources
     *
     * @apiParam {string} :paymentsource_id - id of payment source
     */
    .delete(async (req, res) => {
      const userId = req.UserSession.user_account.id
      const paymentSourceId = req.params.paymentsource_id
      await PaymentSource.DeletePaymentSource(userId, paymentSourceId)
      res.status(200).end()
    })

  /**
   * @api {get} /invoice/cart/:cart_id
   * @apiDescription get an invoice related to a cart
   * @apiGroup Invoice
   *
   * @apiParam {type} :cart_id - cart_id to look for
   */
  router.get('/invoice/cart/:cart_id', async (req, res) => {
    let invoice
    try {
      invoice = await Invoice.GetByCartId(req.params.cart_id)
    } catch (err) {
      logging.info('error getting invoice getbycartId')
      return res.send({}).end()
    }
    await invoice.updateInvoice()
    return res.send(invoice)
  })

  /**
   * @api {post} /api/invoice/:invoice_id/collect send initial collection emails
   * @apiDescription send initial colleciton emails to everyone who owes money except for the admin
   * @apiGroup Invoice
   *
   * @apiParam {string} :invoice_id id of the invoice whose users we are pinging
   */
  router.post('/invoice/:invoice_id/collect', async (req, res) => {
    var invoice = await Invoice.GetById(req.params.invoice_id)
    await invoice.sendCollectionEmail()
    res.sendStatus(200)
  })

  /**
   * @api {post} /api/invoice/:invoice_id/success send success emails
   * @apiDescription send email to all users to announce that the order has successfully gone through
   * @apiGroup Invoice
   *
   * @apiParam {string} :invoice_id id of the invoice whose users we are pinging
   */
  router.post('/invoice/:invoice_id/success', async (req, res) => {
    var invoice = await Invoice.GetById(req.params.invoice_id)
    await invoice.sendSuccessEmail(invoice)
    res.sendStatus(200)
  })

  //TESTING ROUTE to be deleted
  router.get('/remainingpayments/:invoice_id', async (req, res) => {
    var invoice = await Invoice.GetById(req.params.invoice_id)
    var paymentsLeft = await invoice.userPaymentAmounts()
    res.send(paymentsLeft)
  })

  /**
  * @api {post} /invoice/:invoice_type/:cart_id create invoice
  * @apiDescription create an invoice for the specified cart
  * @apiGroup Invoice
  *
  * @apiParam {string} :invoice_type - description of param
  * @apiParam {string} :cart_id - cart id to lookup since we may have multiple systems
  */
  router.post('/invoice/:invoice_type/:cart_id', async (req, res) => {
    // check for old invoice.  deal with this later tbh
    const oldInvoice = await Invoice.GetByCartId(req.params.cart_id)
    if (oldInvoice) {
      // logging.info('invoice already exists for this cart_id, not creating new invoice', oldInvoice.id)
      // return res.send(oldInvoice)
      logging.info('deleteing old invoice for time being')
      await oldInvoice.archive()
    }

    const invoiceData = _.omitBy({
      cart: req.params.cart_id,
      split_type: _.get(req, 'body.split_type')
    }, _.isUndefined)

    logging.info('invoice data', invoiceData)
    const invoice = Invoice.Create(req.params.invoice_type, invoiceData)
    const newInvoice = await invoice.createInvoice()
    logging.info('created new invoice: ', invoiceData)
    return res.send(newInvoice)
  })
}
