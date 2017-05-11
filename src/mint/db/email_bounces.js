var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailBouncesCollection = Waterline.Collection.extend({
  identity: 'email_bounces',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    // id: No id needed for opens

    /**
     * The email record
     * @type {Email}
     */
    email: Waterline.isA('emails')

    /** String list of email addresses in the "To" box */
    "smtp-id": 'string',

    /** Timestamp of email event */
    timestamp: 'integer',

    /** Sendgrid unique event ID */
    sg_event_id: 'string',

    /** Sendgrid unique message ID */
    sg_message_id: 'string',

    /** IP Address where event occurred */
    ip: 'string',

    /** Whether TLS was used when email was sent. 1 for true and 0 for false. */
    tls: 'integer',

    /** Status code string */
    status: 'string',

    /** Reason for email bounce */
    reason: 'string',

    /** Bounce type */
    type: 'string',
  }
})

module.exports = emailBouncesCollection
