'use strict';

const CallingModelLimits = require('./limits');
const DtmfsValidaton = require('./dmtfs');
const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');

/**
 * This is part of the "recognize" action. If the customer wants to speech/dtmf choice based recognition - this needs to be specified.
 * Ex: say "Sales" or enter 1 for Sales department
 *
 * @extends AbstractModelType
 *
 * @property {String} name - Name of the choice. Once a choice matches, this name is conveyed back to the customer in the outcome.
 * @property {String} speechVariation - optional. Speech variations which form the grammar for the choice ( Ex: Name : "Yes" , SpeechVariation : {"Yes", "yeah", "ya", "yo" ).
 * @property {String[]} dtmfVariation -  optional. Dtmf variations for the choice, Ex: Name : "Yes" , DtmfVariation : {'1'}
 */
class RecognitionOption extends AbstractModelType
{
    /**
     * Creates a new recognition option
     *
     * @param {object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.name = null;
        this.speechVariation = null;
        this.dtmfVariation = null;

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

        errors = errors.concat(ModelValidation.validateString(context, this.name, 'RecognitionOption.name'));
        
        var speechVariationSet = this.speechVariation != null;
        var dmftVariationSet = this.dtmfVariation != null;
        
        if(!speechVariationSet && !dmftVariationSet)
        {
            errors.push('Neither RecognitionOption.speechVariation or RecognitionOption.dmftVariation is set');
        }        
        else
        {
            if(speechVariationSet)
            {
                errors = errors.concat(ModelValidation.validateArray(context, this.speechVariation, 'RecognitionOption.speechVariation',
                    false, false, CallingModelLimits.NumberOfSpeechVariations.Max));
                if(errors.length == 0)
                {
                    this.speechVariation.forEach(function(item){
                        errors = errors.concat(ModelValidation.validateString(context, item, 'RecognitionOption.speechVariation item', false));
                    });
                }
            }
            
            if(dmftVariationSet)
            {
                errors = errors.concat(DtmfsValidaton.validateDtmfs(context, this.dtmfVariation, 'RecognitionOption.dtmfVariation'));
            }
        }
        return errors;
    }
}

module.exports = RecognitionOption;