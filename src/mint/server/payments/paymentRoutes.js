const _ = require('lodash');
const express = require('express')
const router = express() // for testing
// const router = express.Router()

const Payments = require('./Payment-BetterName.js')


/**
 * payment Types Handlers
 *
 * @type       {<type>}
 */
const paymentTypes = {
  'mint': new Payments.MintPayments(),
  'cafe': new Payments.CafePayments()
}












/**
 * @api            {get}  /pay/:cart_id/:user_id
 * @apiName        get payment info
 * @apiGroup       Payments
 *
 * @apiDescription Gets the user payment options for the specified cart.
 *
 * @apiParam       {string}  cart_id      {description}
 * @apiParam       {string}  user_id      {description}
 *
 * @apiSuccess                                 <field>
 */
router.get('/pay/:cart_id/:user_id', async (req, res) => {
  const payment = new Payment(req.params.cart_id, req.params.user_id)
})

ap
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


// remove later
const PORT = process.env.PORT || 3000;

router.listen(PORT, () => {
  console.log(`App listening at http://127.0.0.1:${PORT}`);
});



// router.post('/process', (req, res) => co(function * () {
// }))