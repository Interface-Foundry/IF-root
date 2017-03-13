var fs = require('fs')
var path = require('path')
var Email = require('.')
var co = require('co')

// Bring in the html template
var html = fs.readFileSync(path.join(__dirname, '../email_templates/new_cart.html'))

/**
 * This file adds newCart email template to the Email prototype
 */
Email.prototype.newCart = function (options) {
  // TODO parameter checking

  var me = this

  // Save the old ready promise so we can wait for it
  var ready = this.ready

  // Create a new ready promise that waits for our stuff, too
  this.ready = co(function * () {
    yield ready

    // Add html and text to an object on the Email instance
    me.email = yield me._email
    me.email.subject = 'Your Kip Shopping Cart'
    me.email.message_html = `<h1>Kip Cart</h1><a href="http://localhost:3000/cart/${options.cart_id}">View Cart</a>`
    me.email.message_text_fallback = 'Kip Cart\n\nView your cart at http://localhost:3000/cart/' + options.cart_id
  })


  // Make this function chainable
  return this

}
