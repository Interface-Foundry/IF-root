const rp = require('request-promise')
const request = rp.defaults({json: true})

const assert = require('assert')
require('should')

const PORT = process.env.PORT || 3000
const localhost = 'http://127.0.0.1:' + PORT

const server = require('../server/payments/invoice-api.js')
const dbReady = require('../db')
var db




const mockInvoice = {
  id: 'qwertyasdf',
  invoice_type: 'mint',
  cart: 'test12345'
}

const mockCart = {
  id: 'test12345',
  leader: 'user1',
  store: 'amazon',
  store_locale: 'US',
  subtotal: 1995
}

describe('invoice tests', () => {
  before(async () => {
    db = await dbReady
    await db.Carts.create(mockCart)
    await server.listen(PORT)
  })

  it('make sure server is running', async () => {
    const response = await request.get({
      uri:localhost + '/test'
    })
    assert(response)
  })

  it('create an invoice for a cart', async () => {
    const response = await request.post({
      uri: `${localhost}/invoice/${mockInvoice.invoice_type}/${mockCart.id}`
    })
    assert.equal(response.cart, mockInvoice.cart)
  })

  it('create and get the mock invoice', async () => {
    const postResponse = await request.post({
      uri: `${localhost}/invoice/${mockInvoice.invoice_type}/${mockCart.id}`
    })

    const getResponse = await request.get({
      uri: `${localhost}/invoice/${postResponse.id}`,
    })

    assert.equal(postResponse.id, getResponse.id)
  })


  it.skip('create a stripe payment source', async () => {
    // body...
  })

  it.skip('pay the entire invoice from a stripe payment', async () => {
    // body...
  })

  it.skip('split an invoice in half and pay from two different stripe accounts', async () => {
    //body
  })

  it.skip('post a payment from a stripe payment id to an invoice and get remaining balance', async () => {
    // body...
  })

  after(async () => {
    await db.Invoice.destroy({cart: 'test12345'})
    await db.Carts.destroy(mockCart)
  })
})