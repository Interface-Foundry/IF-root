'use strict';

const UserAdded = require('./user-added');

/**
 * The user/bot removed from group chat event.
 * 
 * @extends Event
 * 
 * @property {string} from - The user who added (removed) other users to (from) group chat. 
 * @property {string} to - The group id of the modified group.
 * @property {string[]} targets - The list of added users (usernames).
 * @property {number} eventTime - The event sent timestamp.
 * @property {string} type - The event's type as defined by Messaging Service ("ThreadAddMember").
 */
class UserRemoved extends UserAdded {
    /**
     * Create a user/bot removed from group chat event.
     * 
     * @extends Event
     *  
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {string[]} options.targets - The list of removed users (usernames).
     * @param {number} options.eventTime - The event sent timestamp.
     * @param {string} options.type - The event's type as defined by Messaging Service ("ThreadRemoveMember").
     */
    constructor(event) {
        super(event);
    }
}

module.exports = UserRemoved;