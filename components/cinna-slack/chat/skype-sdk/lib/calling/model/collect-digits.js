'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelLimits = require('./limits');
const DmftsValidation = require('./dmtfs');

/**
 * This is part of the "recognize" action. If the customer wants to collect digits - this needs to be specified.
 * Ex: enter 5 digit zip code followed by pound sign.
 * Either maxNumberOfDtmfs or StopTones must be provided but not both.
 *
 * @extends AbstractModelType
 *
 * @property {Number} maxNumberOfDtmfs - optional. Maximum number of digits expected
 * @property {String[]} StopTones - optional. Stop tones specified to end collection (each stop tone is a char)
 */
class CollectDigits extends AbstractModelType
{
    /**
     * Creates a new collect-digits
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.maxNumberOfDtmfs = null;
        this.stopTones = null;

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
        
        var stopTonesSet = this.stopTones != null;
        
        if(!stopTonesSet && this.maxNumberOfDtmfs == null)
        {
            errors.push('Either CollectDigits.maxNumberOfDtmfs or CollectDigits.stopTones must be set');
        }

        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.maxNumberOfDtmfs,
            'CollectDigits.maxNumberOfDtmfs', CallingModelLimits.NumberOfDtmfsExpected.Min,
            CallingModelLimits.NumberOfDtmfsExpected.Max));
        
        if(stopTonesSet)
        {
            errors = errors.concat(DmftsValidation.validateDtmfsArray(context, this.stopTones, 'CollectDigits.stopTones'));
        }

        return errors;      
    }
}

module.exports = CollectDigits;

