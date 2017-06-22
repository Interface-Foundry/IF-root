const request = require('request-promise').defaults({json: true})
const MockClient = require('./MockClient')

require('should')
const assert = require('assert')

const dbReady = require('../db')
var db

// make sure the server is running
require('../server/')

const invoiceData = {}

var client;
var cartId;
var invoiceId;

describe('invoice tests', () => {

  before(async function () {
    db = await dbReady
    client = await MockClient.getRandomUser()
  })

  it('make sure server is running', async () => {
    const response = await client.get('/api/session')
    assert(response)
  })

  it('create an invoice for a cart', async function () {
    this.timeout(50000)

    // create a user and a cart
    var res = await client.get('/newcart/amazon_US', true)
    cartId = res.request.uri.path.split('/')[2]

    // search and add some stuff
    var stuff = await client.get('/api/itempreview?q=shorts')
    await client.post(`/api/cart/${cartId}/item`, {
      item_id: stuff[0].id,
      user_id: client.user_account.id
    })
    await client.post(`/api/cart/${cartId}/item`, {
      item_id: stuff[1].id,
      user_id: client.user_account.id
    })

    // have another user add something to the cart
    var otheruser = await MockClient.getRandomUser()
    var stuff = await otheruser.get('/api/itempreview?q=pants')
    await otheruser.post(`/api/cart/${cartId}/item`, {
      item_id: stuff[0].id,
      user_id: otheruser.user_account.id
    })

    const response = await client.post(`/api/invoice/mint/${cartId}`)
    assert.equal(response.cart, cartId)
  })

  it.skip('create and get the mock invoice', async () => {
    const postResponse = await request.post({
      uri: `${localhost}/invoice/${mockInvoice.invoice_type}/${mockCart.id}`
    })

    const getResponse = await request.get({
      uri: `${localhost}/invoice/${postResponse.id}`,
    })
    invoiceData.id = getResponse.id
    assert.equal(postResponse.id, getResponse.id)
  })


  it.skip('create a stripe payment source', async () => {
    const newPayment = await request.post({
      uri: `${localhost}/payment/${mockUser.id}`,
      body: {
        payment_source: 'stripe'
      },
      json: true
    })
    console.log('newPayment', newPayment)
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
    await db.Invoice.destroy({cart: mockCart.id})
    await db.PaymentSource.destroy({user: mockUser.id})
    // await db.Carts.destroy(mockCart)
  })
})
