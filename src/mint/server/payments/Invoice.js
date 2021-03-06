var moment = require('moment')
const _ = require('lodash')
const Cart = require('../cart/Cart')
const PaymentSource = require('./PaymentSources.js')
const userPaymentAmountHandler = require('../utilities/invoice_utils').userPaymentAmountHandler

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

// process.env.BASEURL is set in the ecosystem.json files for mint-dev and production
// so if it's not set, use localhost
let baseUrl = process.env.BASEURL || 'http://localhost:3000'

class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }

  static InvoiceInitializer(invoice, invoiceType) {
    if (invoiceType === undefined || invoiceType === 'mint') {
      return new MintInvoice(invoice)
    }
    else {
      return new MintInvoice(invoice)
    }
  }

  /**
   * Gets the Invoice by id
   *
   * @class      GetById (name)
   * @param      {string}   invoiceId  The invoice identifier
   * @return     {Promise}  The invoice db object into class object
   */
  static async GetById (invoiceId) {
    const invoice = await db.Invoices.findOne({id: invoiceId}).populate('leader').populate('cart').populate('address')
    if (_.get(invoice, 'id')) {
      return this.InvoiceInitializer(invoice)
    }
    logging.info('no invoice found for GetbyId')
    return
  }



  /**
   * gets the invoice by Cart
   *
   * @class      GetByCartId (name)
   * @param      {string}   cartId  The cart id
   * @return     {Promise}  the invoices
   */
  static async GetByCartId (cartId) {
    logging.info('trying to get invoice by cartid', cartId)
    const invoice = await db.Invoices.findOne({cart: cartId}).populate('leader').populate('cart').populate('address')
    if (_.get(invoice, 'id')) {
      return this.InvoiceInitializer(invoice)
    }
    logging.info('tried to get by cartid, no invoice exists for cartid')
    return
  }

  /**
   * create a new invoice of type with data
   *
   * @class      Create (name)
   * @param      {string}           invoiceType  The invoice type
   * @param      {object}           invoiceData  The invoice data
   * @return     {invoiceHandlers}  instantiation of the class
   */
  static Create (invoiceData, invoiceType) {
    return this.InvoiceInitializer(invoiceData, invoiceType)
  }

  static async CreateByCartId (cartId) {
    let cart = await Cart.GetById(cartId)
    await cart.sync()

    const invoice = await db.Invoices.create({
      leader: cart.leader,
      cart: cart.id,
      paid: false,
      total: cart.subtotal,
      affiliate_checkout_url: cart.affiliate_checkout_url
    })

    return this.InvoiceInitializer(invoice)
  }


  /**
   * change the status of a refund based on a key that uses authenticat links
   *
   * @class      ChangeRefundStatus (name)
   * @param      {string}   refundKey  The refund key
   * @param      {string}   newStatus  The new status
   * @return     {Promise}  new status
   */
  static async ChangeRefundStatus(refundKey, newStatus) {
    // dont populate link if you want to use link.invoice
    const link = await db.AuthenticationLinks.findOne({ id: refundKey })
    if (!link || !link.invoice) {
      throw new Error('No authentication link exists for this Invoice Change Status thing')
    }

    const invoice = await db.Invoices.findOne({ id: link.invoice })

    /*
     We need a URL route for the kip team to be able to open a link that marks the
     cart as purchased (on Kip's side). If success, it sends a new email to
     hello@kipthis.com saying the cart is purchased by Kip. Then there's another
     URL inside this email to undo marking the cart purchased.
    */

    if (newStatus === 'complete') {
      invoice.refund_ability = false

      // send email
      const adminToEmail = (process.env.ADMIN_TO_EMAIL) ? process.env.ADMIN_TO_EMAIL : 'hello@kipthis.com'
      const email = await db.Emails.create({
        recipients: adminToEmail,
        subject: 'someone at kip successfully purchased cart',
        template_name: 'kip_successfully_purchased_cart'
      })

      await email.template(email.template_name, {
        revertStatusUrl: `${baseUrl}/api/invoice/refund/${refundKey}/revert`,
        invoiceId: invoice.id
      })
      await email.send();
    } else if (newStatus === 'revert') {
      invoice.refund_ability = true
    } else {
      invoice.refund_ability = newStatus
    }

    await invoice.save()
    return invoice
  }


  /**
   * Update a field or object in the db with new data
   *
   * @param      {invoiceId}   invoiceId   The invoice identifier
   * @param      {option}   option      The option to change
   * @param      {optionData}   optionData  The option data
   * @return     {Promise}  the updated invoice
   */
  static async optionUpdate(invoiceId, option, optionData) {
    let invoice
    try {
      invoice = await db.Invoices.findOne({id: invoiceId}).populate('leader').populate('cart')
    } catch (err) {
      logging.error('error updating invoice, invoice does not exist probably', err)
      return
    }
    invoice[option] = optionData
    await invoice.save()

    const updatedInvoice = await this.GetById(invoice.id)
    return updatedInvoice
  }


  async updateInvoice () {
    let cart = await Cart.GetById(this.cart.id)
    await cart.sync()
    if (this.total !== parseInt(cart.SubTotal.Amount)) {
      logging.info('we should update the subtotal', this.total, typeof this.total)
      logging.info('we should update the subtotal', cart.SubTotal.Amount, typeof cart.SubTotal.Amount)
      const invoice = await db.Invoices.findOne({id: this.id})
      invoice.total = cart.SubTotal.Amount
      this.total = cart.SubTotal.Amount
      await invoice.save()
    }
  }

  /**
   * Creates a refund link for kip.
   * use the link.id/:newstatus i.e. invoice/refund/sda4sdfa/false
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async createRefundLinkForKip() {
    logging.info('created link to auth kip after we have created payment')
    const link = await db.AuthenticationLinks.create({
      invoice: this.id
    })
    return link
  }

  /**
   * Creates an invoice in the database.
   *
   * @return     {Promise}  returns the new object created in db
   */
  async createInvoice (cart) {
    // let cart = await Cart.GetById(this.cart)
    if (cart.sync) await cart.sync()

    var newInvoice = await db.Invoices.create({
      leader: cart.leader,
      invoice_type: this.invoice,
      cart: cart.id,
      paid: false,
      total: _.get(cart, 'subtotal'),
      split_type: this.split_type
    })

    await newInvoice.save()
    var invoice = await db.Invoices.findOne({id: newInvoice.id}).populate('leader')
    logging.info('invoice', invoice)
    return invoice
  }

  /**
   * send success email after all payments have gone through
   */
  async sendSuccessEmail (invoice) {
    var invoice = this

    logging.info('shipping address?????', invoice.address)

    var cart = await db.Carts.findOne({id: invoice.cart.id}).populate('items').populate('members')

    var totalItems = cart.items.reduce(function (sum, item) {
      return sum + item.quantity
    }, 0)

    await cart.members.map(async function (user) {
      // var user = await db.UserAccounts.findOne({id: user_id})
      var email = await db.Emails.create({
        recipients: user.email_address,
        subject: 'Your Kip Order has been Placed!',
        template_name: 'success'
      })

      var items = cart.items.filter(item => {
        return item.added_by === user.id
      })

      logging.info('invoice.address', invoice.address)

      logging.info('invoice.cart', invoice.cart)
      await email.template('success', {
        address: invoice.address,
        username: user.name,
        baseUrl: baseUrl,
        items: items.map(item => {
          item.price = item.price / 100
          return item
        }),
        users: cart.members,
        date: moment().format('dddd, MMMM Do, h:mm a'),
        total: '$' + (invoice.total / 100).toFixed(2),
        totalItems: totalItems,
        cart: invoice.cart,
        invoice_id: invoice.id
      })

      await email.send();
    })
  }

  /**
   * calls sendCollectEmail with the reminder flag on
   */
  async sendEmailReminder () {
    logging.info('sendEmailReminder called')
    await this.sendCollectionEmail(true)
  }

  /**
   * email all users about this invoice
   *
   * @param      {boolean} reminder  Is this an initial collection email or a reminder?
   */
  async sendCollectionEmail (reminder) {
    var invoice = this
    var debts = await this.userPaymentAmounts(invoice)

    var cart = await db.Carts.findOne({id: this.id}).populate('items').populate('members')
    var users = cart.members

    var totalItems = cart.items.reduce(function (sum, item) {
      return sum + item.quantity
    }, 0)

    for (var i = 0; i < Object.keys(debts).length; i++) {
      var user_id = debts[Object.keys(debts)[i]]
      if (reminder || user_id !== cart.leader) {
        var user = await db.UserAccounts.findOne({id: user_id})
        var items = cart.items.filter(item => item.added_by === user_id)
        logging.info('preparing to email: ', user.email_address)
        var email = await db.Emails.create({
          recipients: user.email_address,
          subject: 'Your Kip Charge',
          template_name: 'collection'
        })
        // logging.info('created email')
        var text
        if (reminder) text = 'Thanks for using Kip! Remember, you still owe $' + debts[user_id] / 100 + ' at your earliest possible convenience.'
        else text = 'Thanks for using Kip! Please pay $' + debts[user_id] / 100 + ' at your earliest possible convenience 😊'
        // logging.info('about to template')
        await email.template('collection', {
          username: user.name,
          baseUrl: baseUrl,
          items: items.map(item => {
            item.price = item.price / 100
            return item
          }),
          users: users,
          date: moment().format('dddd, MMMM Do, h:mm a'),
          total: '$' + (invoice.total / 100).toFixed(2),
          totalItems: totalItems,
          cart: invoice.cart,
          invoice_id: invoice.id,
          text: text,
          user_amount: debts[user_id] / 100
        })
        // logging.info('templated; about to send')
        await email.send();
        logging.info('just sent collection email')
      }
    }
  }

  /**
   * check if invoice is paid off by all its payments
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async paidInFull() {
    const payments = await db.Payments.find({invoice: this.id})
    const amountPaid = payments.reduce((prev, curr) => {
      return prev += curr.amount
    }, 0)

    if (amountPaid >= this.total) {
      logging.info('PAID IN FULL', amountPaid, this.total)
      return true
    }
    return false
  }

  /**
   * determine how much each user has left to pay
   * if a user as payed as much or more than they owe, they will be deleted from the return value
   *
   * @return {object} { keys are user ids; values are the amount they have left to pay}
   */
  async userPaymentAmounts() {
    if (!this.split_type) {
      var invoice = await db.Invoices.findOne({cart: this.id})
      this.split_type = invoice.split_type
    }
    var amounts = userPaymentAmountHandler[this.split_type](this)
    var payments = await db.Payments.find({invoice: this.id})
    payments.map(function (p) {
      amounts[p.user] -= p.amount
      if (amounts[p.user] <= 0) delete amounts[p.user]
    })
    return amounts
  }

  /**
   * function to get status of all the users payments to display to cart leader
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async usersPayments() {

    const cart = await db.Carts.findOne({id: _.get(this, 'cart.id')}).populate('members')

    const userPayments = await cart.members.map(async (user) => {
      const paymentObject = await PaymentSource.GetPaymentStatus(user.id, this.id)
      paymentObject.name = user.name
      paymentObject.user_id = user.id
      logging.info('got this paymentObject', paymentObject)
      return paymentObject
    })

    return Promise.all(userPayments)
  }


  /**
   * abstracted action handler to email users/do things
   *
   * @param      {string}   action  The action
   * @param      {object}   data    The data
   * @return     {Promise}  the promise of the action
   */
  async doAction(action, data) {
    logging.info('attempting to do action, with data:', action, data)
    const handlers = {
      email: this.emailUser
    }
    const response = await handlers[action](data)
    return response
  }


  async emailUser(data) {
    if (data.user_id) {
      logging.info('emailing specific user_id', data.user_id)
      const user = await db.UserAccounts.findOne({id: data.user_id})
      const email = await db.Emails.create({
        recipients: user.email_address,
        subject: 'Admin wants you to pay!',
        template_name: 'collection'
      })

      const text = `Thanks for using Kip! The admin of cart clicked a button to send this email, you still owe $${data.amount / 100} at your earliest possible convenience.`

      await email.template('collection', {
        username: user.name,
        baseUrl: baseUrl,
        items: [],
        users: [data],
        date: moment().format('dddd, MMMM Do, h:mm a'),
        total: '$' + (data.amount / 100).toFixed(2),
        totalItems: 1,
        cart: this.cart,
        invoice_id: this.id,
        text: text,
        user_amount: data.amount / 100
      })

      await email.send();
      logging.info('just sent collection email')

    }
  }
}

class MintInvoice extends Invoice {
  constructor(args) {
    super('mint')
    Object.assign(this, args)
  }

  static get name() {
    return 'mint'
  }

  async checkPrevInvoice () {
    const invoice = await db.Invoices.findOne({cart: this.cart}).populate('leader')
    if (invoice) {
      return invoice
    }
    return null
  }
}




module.exports = Invoice
