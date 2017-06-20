const bodyParser = require('body-parser')
const express = require('express')
const request = require('request-promise').defaults({json: true})
const router = express()

require('should')
const assert = require('assert')

const PORT = process.env.PORT || 3000
const localhost = 'http://127.0.0.1:' + PORT


const dbReady = require('../db')
var db


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}))

require('../server/routes/invoice-api.js')(router)

// test route
router.get('/test', async (req, res) => {
  res.sendStatus(200)
})


const mockInvoice = {
  id: 'qwertyasdf',
  invoice_type: 'mint',
  cart: 'test12345'
}

const invoiceData = {}

const mockCart = {
  id : "34134b29d09d",
  "store" : "amazon",
  "store_locale" : "US",
  "leader" : "23a67df1-36c4-4636-bc97-3059b2945fd4",
  "name" : "6/7/17 Kip Cart",
  "views" : 0,
  "createdAt" : "2017-06-07T21:32:36.706Z",
  "updatedAt" : "2017-06-07T21:34:30.463Z",
  "dirty" : true,
  "oldItems" : [],
  "addingItem" : false,
  "thumbnail_url" : "//storage.googleapis.com/kip-random/kip_head_whitebg.png",
  "locked" : false,
  "cart_id" : "34134b29d09d",
  "amazon_cartid" : "145-7192509-6881338",
  "amazon_hmac" : "qXAnGAA82EM90SNUkDjq89RD1JQ=",
  "amazon_purchase_url" : "https://www.amazon.com/gp/cart/aws-merge.html?cart-id=145-7192509-6881338&associate-id=motorwaytoros-20&hmac=qXAnGAA82EM90SNUkDjq89RD1JQ%3D&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&MergeCart=False",
  "affiliate_checkout_url" : "https://goo.gl/YG4iu3"
}

const mockUser = {
    id : '23a67df1-36c4-4636-bc97-3059b2945fd4',
    "email_address" : "graham.annett@gmail.com",
    "name" : "graham.annett",
    "reminded" : false,
    "createdAt" : "2017-06-07T21:26:35.580Z",
    "updatedAt" : "2017-06-07T21:26:35.580Z"
}

describe('invoice tests', () => {
  before(async () => {
    db = await dbReady
    await router.listen(PORT)
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
    invoiceData.id = getResponse.id
    assert.equal(postResponse.id, getResponse.id)
  })


  it('create a stripe payment source', async () => {
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
