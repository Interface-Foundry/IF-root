'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelEnums = require('./enums');

/**
 * Represents a participant within a RosterUpdateNotification notification.
 *
 * @extends AbstractModelType
 *
 * @property {String} identity - optional. MRI of the participant
 * @property {String} mediaStreamDirection - direction of the media (send, receive, ...).
 * @property {String} mediaType - optional, CallingModelEnums.ModalityType. Participant media type (audio, video, ...).
 */
class RosterParticipant extends AbstractModelType
{
    /**
     * Creates a new roster participant
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.identity = null;
        this.mediaType = null;
        this.mediaStreamDirection = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = [];

        errors = errors.concat(ModelValidation.validateString(context, this.identity, 'RosterParticipant.identity'));
        errors = errors.concat(ModelValidation.validateString(context, this.mediaStreamDirection, 'RosterParticipant.mediaStreamDirection'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.mediaType, CallingModelEnums.ModalityType, 'RosterParticipant.mediaType'));
        
        return errors;      
    }
}

module.exports = RosterParticipant;