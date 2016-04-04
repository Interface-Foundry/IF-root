'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');

/**
 * Callback link to call back the customer on, once we have performed the set of actions.
 *
 * @extends AbstractModelType
 *
 * @property {String} callBack - absolute http or https url
  */
class CallBackLink extends AbstractModelType
{
    /**
     * Creates a new callback link
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.callBack = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context) {
        var errors = [];

        errors = errors.concat(ModelValidation.validateString(context, this.callBack, 'CallBackLink.callBack'));
        if(this.callBack != null && !(/^https?:\/\//i.test(this.callBack)))
            errors.push('CallBackLink.callBack should be absolute URL but is ' + this.callBack);
        
        return errors;      
    }
}

module.exports = CallBackLink;