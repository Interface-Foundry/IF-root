var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailsCollection = Waterline.Collection.extend({
  identity: 'emails',
  connection: 'default',
  attributes: {
    email_id: {
      type: 'text',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4()
      }
    },

    /** User accounts which have email addresses */
    recipients: {
      collection: 'user_accounts',
      via: 'user_id'
    },

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
    email_type: 'string'

  }
})

module.exports = emailsCollection
