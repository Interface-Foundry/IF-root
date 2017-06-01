const request = require('request-promise')
const assert = require('assert')
require('should')

const PORT = process.env.PORT || 3000
const localhost = 'http://127.0.0.1:' + PORT

const server = require('../server/payments/invoice-api.js')
const dbReady = require('../db')
var db

const mockInvoice = {
  invoice_type: 'mint',
  cart: 'test12345'
}

const mockCart = {
  id: 'test12345',
  subtotal: 1995
}

describe('invoice', () => {
  before(async () => {
    db = await dbReady
    await db.Invoice.create(testVars)
    await server.listen(PORT)
  })

  it('make sure server is running', async () => {
    const response = await request.get({
      uri:localhost + '/test'
    })
    assert(response)
  })

  it.skip('create an invoice for a cart', async () => {

  })

  it.skip('create an invoice and then get it', async () => {
    // body...
  })

  after(async () => {
    const deleteThis = await db.Invoice.findOne({cart: testVars.cart})
    await db.Invoice.destroy(testVars)
  })
})