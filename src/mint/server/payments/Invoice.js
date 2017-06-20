var moment = require('moment')
const Cart = require('../cart/Cart')

const email_utils = require('../utilities/email_utils')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const userPaymentAmountHandler = {
  'split_equal': function (invoice) {
    logging.info('even split')
    var debts = {}
    var perUser = invoice.total / (1.0 * invoice.members.length)
    invoice.members.map(function (user) {
      debts[user.id] = perUser
    })
    return debts
  },
  'split_single': function (invoice) {
    logging.info('single payer split')
    var debts = {}
    debts[invoice.leader.id] = invoice.total
    return debts
  },
  'split_by_item': async function (invoice) {
    var cart = await db.Carts.findOne({id: invoice.cart}).populate('items')
    var debts = {}
    cart.items.map(function (item) {
      if (debts[item.added_by]) debts[item.added_by] += item.price
      else debts[item.added_by] = item.price
    })
    return debts
  }
}

class Invoice {
  constructor(invoiceType) {
    this.invoice = invoiceType
  }

  /**
   * Gets the Invoice by id
   *
   * @class      GetById (name)
   * @param      {string}   invoiceId  The invoice identifier
   * @return     {Promise}  The invoice db object into class object
   */
  static async GetById (invoiceId) {
    const invoice = await db.Invoices.findOne({id: invoiceId}).populate('leader').populate('cart').populate('members')
    if (!invoice) {
      throw new Error('no invoice found')
    }
    return new invoiceHandlers[invoice.invoice_type](invoice)
  }



  /**
   * gets the invoice by Cart
   *
   * @class      GetByCartId (name)
   * @param      {string}   cartId  The cart id
   * @return     {Promise}  the invoices
   */
  static async GetByCartId (cartId) {
    const invoice = await db.Invoices.find({cart: cartId}).populate('leader').populate('cart').populate('members')
    return invoice
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
    return new invoiceHandlers[invoiceType](invoiceData)
  }


  optionUpdate(option, optionData) {
    Object.assign(this, {[option]: optionData})
  }


  actionHandler(action, actionData) {
    const handlers = {
      email: this.emailUsers
    }

    return handlers[action](actionData)
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
      total: cart.subtotal,
      split_type: this.split_type
    })

    cart.members.map(function (m) {
      newInvoice.members.add(m.id)
    })

    await newInvoice.save()
    var invoice = await db.Invoices.findOne({id: newInvoice.id}).populate('members')

    // await this.sendCollectionEmail(invoice, true)
    // await this.sendSuccessEmail(invoice)

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

    // var formattedItems = await email_utils.formatItems(cart.items)
    // var items = formattedItems[0]
    // var users = formattedItems[1]

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

      logging.info('cart link:', baseUrl + '/cart/' + cart.id)
      await email.template('success', {
        username: user.name,
        baseUrl: baseUrl,
        id: cart.id,
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
   * email all users about this invoice
   *
   * @param      {array}   invoice   This invoice
   * @param      {boolean} reminder  Is this an initial collection email or a reminder?
   */
  async sendCollectionEmail (reminder) {
    var invoice = this
    var debts = await this.userPaymentAmounts(invoice)
    // logging.info('debts', debts)

    if (process.env.NODE_ENV.includes('production')) var baseUrl = 'kipthis.com'
    else if (process.env.NODE_ENV.includes('development_')) var baseUrl = 'localhost:3000'
    else var baseUrl = 'mint-dev.kipthis.com'

    var cart = await db.Carts.findOne({id: this.cart.id}).populate('items').populate('members')
    var users = cart.members

    // var formattedItems = await email_utils.formatItems(cart.items)
    // var items = formattedItems[0]
    // var users = formattedItems[1]
    var totalItems = cart.items.reduce(function (sum, item) {
      return sum + item.quantity
    }, 0)

    await Object.keys(debts).map(async function (user_id) {
      if (user_id !== cart.leader && !reminder) {
        var user = await db.UserAccounts.findOne({id: user_id})
        var items = cart.items.filter(item => item.added_by === user_id)
        var email = await db.Emails.create({
          recipients: user.email_address,
          subject: 'Your Kip Charge',
          template_name: 'collection'
        })

        if (reminder) var text = 'Thanks for using Kip! Remember, you still owe $' + debts[user_id] + ' at your earliest possible convenience.'
        else var text = 'Thanks for using Kip! Please pay $' + debts[user_id] + ' at your earliest possible convenience 😊'

        await email.template('collection', {
          username: user.name,
          baseUrl: baseUrl,
          id: invoice.cart,
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

        await email.send();
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


  async userPaymentAmounts(invoice) {
    return userPaymentAmountHandler[this.split_type](invoice)
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
    const invoice = await db.Invoices.findOne({cart: this.cart})
    if (invoice) {
      return invoice
    }
    return null
  }

  /**
   * we dont need to actually create a charge but after a user checks out an
   * amazon cart we should note what items or whatever were in the cart at this point
   */
  get createAmazonCharge() {

  }

  // methods
}


const invoiceHandlers = {
  [MintInvoice.name]: MintInvoice,
}


module.exports = Invoice
