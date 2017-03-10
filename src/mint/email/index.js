var co = require('co')
var sendMail = require('../../mail/IF_mail').send

var db
const dbReady = require('../db')
dbReady.then(models => db = models)


function Email(emailOptions) {
  // TODO type check emailOptions
  
  this._email = db.Emails.create({
    recipients: [emailOptions.to]
  })

  this.ready = this._email
}

Email.prototype.testingEmail = function (options) {
  console.log('testing email')
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

Email.prototype.send = function() {
  var me = this
  return co(function *() {
    // wait for everything that might need to happen
    yield me.ready
    console.log('sending email')
    var options = {
      to: 'peter.m.brandt@gmail.com',
      from: 'Kip <hello@kipthis.com>',
      subject: me.email.subject,
      html: me.email.message_html,
      text: me.email.message_text_fallback
    }
    console.log(options)
    yield sendMail(options)
  })
}

module.exports = Email

