const _ = require('lodash');
const express = require('express')
const router = express() // for testing
// const router = express.Router()

const MintPayments = require('./mintPayment.js')
const CafePayments = require('./cafePayment.js')

/**
 * payment Types Handlers
 *
 * @type       {<type>}
 */
const paymentTypes = {
  'mint': new MintPayments(),
  'cafe': new CafePayments()
}


/**
 * @api {get} /session/:session_token
 * @apiDescription get session
 * @apiGroup Payments
 *
 * @apiParam {type}  - description of param
 *
 *
 */
router.get('/session/:session_token', async (req, res) => {
  // clean special char
  const token = req.body.session_token.replace(/[^\w\s]/gi, '')
  // var pay = await Payment.findOne({session_token: token})
  // return res.send(pay)
})



/**
 * @api {post} /charge/:cart_type
 * @apiDescription create charge or something
 * @apiGroup Payments
 *
 * @apiParam {string} :cart_type - description of param
 */
router.post('/charge/:cart_type/:id', async (req, res) => {
  await chargeHandlers[req.params.type](req.body)
})





// router.post('/process', (req, res) => co(function * () {
// }))