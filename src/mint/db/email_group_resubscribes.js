var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailGroupResubscribesCollection = Waterline.Collection.extend({
  identity: 'email_group_resubscribes',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    // id: No id needed for opens

    /**
     * The email record
     * @type {Email}
     */
    email: Waterline.isA('emails')

    /** Timestamp of email event */
    timestamp: 'integer',

    /** IP Address where event occurred */
    ip: 'string',

    /** Sendgrid unique event ID */
    sg_event_id: 'string',

    /** Sendgrid unique message ID */
    sg_message_id: 'string',

    /** User agent where event occurred */
    useragent: 'string',
  }
})

module.exports = emailGroupResubscribesCollection
