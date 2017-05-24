/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../../db');


async function createPayment(type, amount, etc) {
  const payment = await db.Payments.create({
    type: type,
    amount: amount,
    other: etc
  })
  payment.save()
  return payment
}

/**
 * Class for mint.
 *
 * @class      Mint (name)
 */
class MintPayments {
  constructor(args) {
    // code
  }

  createPaymentInDb() {

  }

  // methods
}


/**
 * Class for cafe payments.
 *
 * @class      CafePayments (name)
 */
class CafePayments {
  constructor(args) {

  }



  /**
   * Creates a new payment.
   *
   * @param      {<type>}  args    The arguments
   */
  createNewPayment(args) {

  }
}

async function f1 () {
  let user = await db.UserAccounts.findOne({_id: 'eff781b1-2d62-42f3-8eb8-b55ea240bcd0'})
  console.log(user)
}

async function main() {
  console.log('awaiting db')
  var db = await dbReady
  let user = await db.UserAccounts.findOne({_id: 'eff781b1-2d62-42f3-8eb8-b55ea240bcd0'})
  console.log(user)
}

main()