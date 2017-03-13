var co = require('co')
var sendMail = require('../../mail/IF_mail').send

var db
const dbReady = require('../db')
dbReady.then(models => db = models)

/**
 * Creates a new email object with the basic email options
 * The other files in this directory specify specific emails to send
 * 
 * Basic usage:
 * // Create it
 * var email = new Email({to: ...})
 *
 * // Specify the template and the data
 * email.newCart({cart_id: ...})
 *
 * // Send it
 * yield email.send()
 */
function Email(emailOptions) {
  // TODO type check emailOptions
  
  this._email = db.Emails.create()
  this.emailOptions = emailOptions

  this.ready = this._email
}

/**
 * Sends an email, returns a promise. Usually looks like this:
 * var email = new Email({to: ...}).newCart({cart_id})
 * yield email.send()
 */
Email.prototype.send = function() {
  var me = this
  return co(function *() {
    // wait for everything that might need to happen
    yield me.ready
    me.email.recipients = [me.emailOptions.to]
    yield me.email.save()

    // find the user's email addresses


		/**
			Example from https://nodemailer.com/about/
			let mailOptions = {
    		from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
    		to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
    		subject: 'Hello ✔', // Subject line
    		text: 'Hello world ?', // plain text body
    		html: '<b>Hello world ?</b>' // html body
			};
		*/
    var options = {
      from: 'Kip <hello@kipthis.com>',
      to: me.emailOptions.to.map(u => u.email_address).join(', '),
      subject: me.email.subject,
      html: me.email.message_html,
      text: me.email.message_text_fallback
    }
    yield sendMail(options)
  })
}

module.exports = Email

require('./new_cart')
