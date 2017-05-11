var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailClicksCollection = Waterline.Collection.extend({
  identity: 'email_clicks',
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

    /** Sendgrid unique event ID */
    sg_event_id: 'string',

   /** Sendgrid unique message ID */
    sg_message_id: 'string',

    /** IP Address where event occurred */
    ip: 'string',

    /** User agent where event occurred */
    useragent: 'string',

    /** Index of group of links. Type of link clicked */
    url_offset: {
      index: 'integer',
      type: 'string'
    },

    /** URL of link clicked */
    url: 'string',
  }
})

module.exports = emailClicksCollection
