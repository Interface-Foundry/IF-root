const _ = require('lodash')
const moment = require('moment');

const Invoice = require('../payments/Invoice.js')
const PaymentSource = require('../payments/PaymentSources.js')
const utils = require('../utilities/invoice_utils.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

module.exports = function (router) {

  // ------------------------------------
  // --------- GENERAL ROUTES  ----------
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
     * @apiParam {string} option - type of thing we are doing
     */
    .post(async (req, res) => {
      const invoice = await Invoice.GetById(req.params.invoice_id)
      if (_.get(req, 'body.option_chage')) {
        await invoice.optionUpdate(req.body.option_change, req.body.option_data)
      } else if (_.get(req, 'body.action')) {
        await invoice.doAction(req.body.action)
      }
      return res.send(invoice)
    })

  /**
   * invoice routes related to payments for an invoice (collecting/getting payments,)
   */
  router.route('/invoice/payment/:invoice_id')
    /**
     * @api {get} /invoice/payment/:invoice_id get/collect payments for invoice
     * @apiDescription collect payments for an invoice, either via email, alert, etc
     * @apiGroup Payments
     *
     * @apiParam {string} :invoice_id - invoice id
     * @apiParam {string} collection_metho (optional) - preference for how to bother users
     */
    .get(async (req, res) => {
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
     * @api {post} /invoice/payment/:invoice_idpost payment source to invoice
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
      logging.info('got the payment source')
      const paymentAmount = req.body.payment_amount
      logging.info('ditto amount')
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
     * @apiParam {string} body.payment_source - which type of payment source we are creating
     * @apiParam {json} payment_info - whatever response from specific payment source
     */
    .post(async (req, res) => {
      if (!_.get(req, 'body.payment_source')) {
        throw new Error('If creating new payment source need source specified')
      }
      const paymentType = req.body.payment_source
      const paymentSource = await PaymentSource.Create(paymentType, {user: req.params.user_id})
      const createdSource = await paymentSource.createPaymentSource(req.body)
      logging.info('new payment source:', createdSource)
      return res.send(createdSource)
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
    const invoiceData = _.omitBy({
      cart: req.params.cart_id,
      split: _.get(req, 'body.split_type', 'equal')
    }, _.isUndefined)

    logging.info('invoice data', invoiceData)

    const invoice = Invoice.Create(req.params.invoice_type, invoiceData)
    const newInvoice = await invoice.createInvoice()
    return res.send(newInvoice)
  })
}
