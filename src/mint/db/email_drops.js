var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailDropsCollection = Waterline.Collection.extend({
  identity: 'email_drops',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    // id: No id needed for opens

    /**
     * The email record
     * @type {Email}
     */
    email: Waterline.isA('emails')

    // email: 'string' //stored in emails.recipient
    "smtp-id": 'string',
    timestamp: 'integer',
    // asm_group_id: 'integer', //stored in emails.unsubscribe_group_id
    sg_event_id: 'string',
    sg_message_id: 'string',
    reason: 'string',

  }
})

module.exports = emailDropsCollection
