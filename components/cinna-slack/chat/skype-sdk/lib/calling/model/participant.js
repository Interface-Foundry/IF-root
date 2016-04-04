'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');

/**
 * Creates a new participant
 * This can be a participant in any modality in a 2 or multi-party conversation
 *
 * @extends AbstractModelType
 *
 * @property {String} identity - optional. MRI of the participant, ex : 2:+14258828080 or '8:alice'
 * @property {String} displayName - optional, display name of participant, ex 'Pepa z depa'
 * @property {String} languageId - optional, participant language if known
 * @property {Boolean} originator - whether this participant the originator of the conversation
  */
class Participant extends AbstractModelType
{
    /**
     * Creates a new participant
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.identity = null;
        this.displayName = null;
        this.languageId = null;
        this.originator = false;

        if(inputData != null) this.populatePlainInput(inputData);
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

        errors = errors.concat(ModelValidation.validateString(context, this.identity, 'Participant.identity'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.displayName, 'Participant.displayName'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.languageId, 'Participant.languageId'));
        errors = errors.concat(ModelValidation.validateBoolean(context, this.originator, 'Participant.originator'));

        return errors;      
    }
}

module.exports = Participant;
