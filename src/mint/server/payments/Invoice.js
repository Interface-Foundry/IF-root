var moment = require('moment')
const _ = require('lodash')
const Cart = require('../cart/Cart')
const userPaymentAmountHandler = require('../utilities/invoice_utils').userPaymentAmountHandler

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })


class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }

  static InvoiceInitializer(invoice) {
    return new MintInvoice(invoice)
  }

  /**
   * Gets the Invoice by id
   *
   * @class      GetById (name)
   * @param      {string}   invoiceId  The invoice identifier
   * @return     {Promise}  The invoice db object into class object
   */
  static async GetById (invoiceId) {
    const invoice = await db.Invoices.findOne({id: invoiceId}).populate('leader').populate('cart')
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
    const invoice = await db.Invoices.findOne({cart: cartId}).populate('leader').populate('cart')
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
  static Create (invoiceType, invoiceData) {
    return this.InvoiceInitializer(invoice)
  }

  static async CreateByCartId (cartId) {
    const cart = await db.Carts.findOne({id: cartId})
    return this.InvoiceInitializer(invoice)
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


  actionHandler(action, actionData) {
    const handlers = {
      email: this.emailUsers
    }

    return handlers[action](actionData)
  }

  async updateInvoice () {
    let cart = await Cart.GetById(this.cart.id)
    await cart.sync()
  }

  /**
   * Creates an invoice in the database.
   *
   * @return     {Promise}  returns the new object created in db
   */
  async createInvoice () {
    let cart = await Cart.GetById(this.cart)
    await cart.sync()

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

    return invoice
  }

  /**
   * send success email after all payments have gone through
   */
  async sendSuccessEmail (invoice) {
    var invoice = this
    if (process.env.NODE_ENV.includes('production')) var baseUrl = 'kipthis.com'
    else if (process.env.NODE_ENV.includes('development_')) var baseUrl = 'localhost:3000'
    else var baseUrl = 'mint-dev.kipthis.com'

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

      // logging.info('cart link:', baseUrl + '/cart/' + cart.id)
      logging.info('invoice.cart', invoice.cart)
      await email.template('success', {
        username: user.name,
        baseUrl: baseUrl,
        items: items,
        users: cart.members,
        date: moment().format('dddd, MMMM Do, h:mm a'),
        total: invoice.total,
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
    // logging.info('send collection email called')
    var invoice = this
    var debts = await this.userPaymentAmounts(invoice)
    // logging.info('debts', debts)

    if (process.env.NODE_ENV.includes('production')) var baseUrl = 'http://kipthis.com'
    else if (process.env.NODE_ENV.includes('development_')) var baseUrl = 'http://localhost:3000'
    else var baseUrl = 'http://mint-dev.kipthis.com'

    var cart = await db.Carts.findOne({id: this.cart.id}).populate('items').populate('members')
    var users = cart.members

    var totalItems = cart.items.reduce(function (sum, item) {
      return sum + item.quantity
    }, 0)

    // logging.info('about to map over owing users')
    await Object.keys(debts).map(async function (user_id) {
      // logging.info('w/in the await')
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
        if (reminder) var text = 'Thanks for using Kip! Remember, you still owe $' + debts[user_id] + ' at your earliest possible convenience.'
        else var text = 'Thanks for using Kip! Please pay $' + debts[user_id] + ' at your earliest possible convenience 😊'
        // logging.info('about to template')
        await email.template('collection', {
          username: user.name,
          baseUrl: baseUrl,
          items: items,
          users: users,
          date: moment().format('dddd, MMMM Do, h:mm a'),
          total: invoice.total,
          totalItems: totalItems,
          cart: invoice.cart,
          invoice_id: invoice.id,
          text: text,
          user_amount: debts[user_id]
        })
        // logging.info('templated; about to send')
        await email.send();
        logging.info('just sent collection email')
      }
    })
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
    var amounts = userPaymentAmountHandler[this.split_type](this)
    var payments = await db.Payments.find({invoice: this.id})
    payments.map(function (p) {
      amounts[p.user] -= p.amount
      if (amounts[p.user] <= 0) delete amounts[p.user]
    })
    return amounts
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
