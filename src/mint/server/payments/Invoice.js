var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

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
    const invoice = await db.Invoice.findOne({id: invoiceId}).populate('leader').populate('cart').populate('members')
    if (!invoice) {
      throw new Error('no invoice found')
    }
    return new invoiceHandlers[invoice.invoice_type](invoice)
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

    const newInvoice = await db.Invoice.create({
      leader: cart.leader,
      members: cart.members.map(member => member.id),
      invoice_type: this.invoice,
      cart: cart.id,
      paid: false,
      total: cart.subtotal
    })

    return newInvoice
  }

  /**
   * email all users about this invoice
   *
   * @param      {array}   users   The users
   */
  async emailUsers (users) {
    users.map(async (user) => {
      const email = await db.Emails.create({
        recipients:'user.email',
        subject: 'Payment Subject',
        cart: this.cart
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
    const payments = await db.Payment.find({id: this.invoice_id})
    const amountPaid = payments.reduce((curr, prev) => {
      return prev += curr.amount
    }, 0)
    if (amountPaid > this.total) {
      return true
    }
    return false
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
    const invoice = await db.Invoice.findOne({cart: this.cart})
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