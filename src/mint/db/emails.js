var Waterline = require('waterline')
var uuid = require('uuid')
var templates = require('../email_templates')
var co = require('co')
var sendMail = require('../../mail/IF_mail').send

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailsCollection = Waterline.Collection.extend({
  identity: 'emails',
  connection: 'default',
  attributes: {

    /** User accounts which have email addresses */
    recipients: 'string',

    /** Sender should probably always be kip */
    sender: 'string',

    /** Subjectline */
    subject: 'string',

    /** HTML message, the primary message */
    message_html: 'string',

    /** Text-only fallback for the message */
    message_text_fallback: 'string',

    /** The date on our servers when we sent the message */
    date_sent: 'date',

    /** The type of email */
    email_type: 'string',

    /** Use a template for the email */
    template: function(name, data) {
      this.message_html = templates(name, data)
      return this.save()
    },

    /** send an email */
    send: function () {
      var me = this
      return co(function *() {
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
          to: me.recipients,
          subject: me.subject,
          html: me.message_html,
          text: me.message_text_fallback
        }
        yield sendMail(options)
      })

    }

  }
})

module.exports = emailsCollection
