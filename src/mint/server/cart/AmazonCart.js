const Cart = require('./Cart.js')

class AmazonCart extends Cart {
  constructor(options) {
    super(options)
  }
}

module.exports = AmazonCart
