var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailEventsCollection = Waterline.Collection.extend({
  identity: 'email_events',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    // id: No id needed for opens

    /**
     * The email record
     * @type {Email}
     */
    email: Waterline.isA('emails')

    /** 
     * Event type
     * Available for all events
     */
    event: 'string',

    /** 
     * IP Address where event occurred 
     * Available for bounce, click, deliver, group resubscribe, group unsubscribe, and open events
     */
    ip: 'string',

    /** 
     * Reason for email failure 
     * Available for bounce and drop events
     */
    reason: 'string',

    /** 
    * Response from mail transfer agent 
    * Available for deliver events
    */
    response: 'string',

    /** 
     * Sendgrid unique event ID      
     * Available for all events
     */
    sg_event_id: 'string',

    /** 
     * Sendgrid unique message ID 
     * Available for all events
     */
    sg_message_id: 'string',

    /** 
     * Sendgrid unique SMTP ID 
     * Available for bounce, deliver, drop, and process events
     */
    "smtp-id": 'string',

    /** 
     * Status code string 
     * Available for bounce events
     */
    status: 'string',

    /** 
     * Timestamp of email event 
     * Available for all events
     */
    timestamp: 'integer',

    /** 
     * Whether TLS was used when email was sent. 1 for true and 0 for false. 
     * Available for bounce and deliver events
     */
    tls: 'integer',

    /** 
     * Email failure type 
     * Available for bounce events
     */
    type: 'string',

    /** 
     * URL of link clicked
     * Available for click events
     */
    url: 'string',

    /** 
     * Index of group of links. Type of link clicked 
     * Available for click events
     */
    url_offset: {
      index: 'integer',
      type: 'string'
    },

    /** 
     * User agent where event occurred 
     * Available for click, group resubscribe, group unsubscribe, and open events
     */
    useragent: 'string',

  }
})

module.exports = emailEventsCollection
