var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })


const userPaymentAmountHandler = {
  'split_equal': function (invoice) {
    logging.info('even split')
    logging.info('invoice:', invoice)
    var debts = {}
    var perUser = invoice.total / (1.0 * invoice.members.length)
    invoice.members.map(function (user) {
      debts[user.id] = perUser
    })
    logging.info('debts', debts)
    return debts
  },
  'single': function (invoice) {
    logging.info('single payer split')
    var debts = {}
    debts[invoice.leader] = invoice.total
    return debts
  },
  'split_by_item': async function (invoice) {
    logging.info('split by item')
    var cart = await db.Carts.findOne({id: invoice.cart}).populate('items')
    var debts = {}
    cart.items.map(function (item) {
      logging.info('item', item)
      if (debts[item.added_by]) debts[item.added_by] += item.price
      else debts[item.added_by] = item.price
    })
    logging.info('debts', debts)
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
    const cart = await db.Carts.findOne({id: this.cart}).populate('members')
    if (!cart) {
      throw new Error('Invoice needs to be attached to invoice')
    }

    var newInvoice = await db.Invoices.create({
      leader: cart.leader,
      invoice_type: this.invoice,
      cart: cart.id,
      paid: false,
      total: cart.subtotal,
      split_type: this.split
    })

    cart.members.map(function (m) {
      newInvoice.members.add(m.id)
    })

    await newInvoice.save()
    var invoice = await db.Invoices.findOne({id: newInvoice.id}).populate('members')

    await this.sendCollectionEmail(invoice)

    return invoice
  }

  /**
   * email all users about this invoice
   *
   * @param      {array}   users   The users
   */
  async sendCollectionEmail (invoice) {
    logging.info('this', this)
    logging.info('send collection email called')
    var debts = await this.userPaymentAmounts(invoice)
    await Object.keys(debts).map(async function (user_id) {
      var user = await db.UserAccounts.findOne({id: user_id})
      var email = await db.Emails.create({
        recipients: user.email_address,
        subject: 'You owe Kip $'+ debts[user_id] ,
        cart: invoice.cart
      })

      email.template('payment', {
        username: user.name
      })

      await email.send();
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
    return userPaymentAmountHandler[this.split](invoice)
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
