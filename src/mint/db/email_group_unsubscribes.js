var Waterline = require('waterline')
var uuid = require('uuid')

/**
 * Emails collection stores all the common data for any email we send out
 * Considerable insirpation taken from <https://schema.org/EmailMessage>
 */
var emailGroupUnsubscribesCollection = Waterline.Collection.extend({
  identity: 'email_group_unsubscribes',
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
    // asm_group_id: 'integer', //stored in emails.unsubscribe_group_id
    timestamp: 'integer',
    ip: 'string',
    sg_event_id: 'string',
    sg_message_id: 'string',
    useragent: 'string',
  }
})

module.exports = emailGroupUnsubscribesCollection
