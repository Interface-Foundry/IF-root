'use strict';

const AbstractModelType = require('./abstract-model-type');
const CallingModelLimits = require('./limits');
const CallingModelEnums= require('./enums');
const ModelValidation = require('./model-validation');

/**
 * Represents a single prompt.
 * Either value, fileUri or silenceLengthInMilliSeconds must be set, but not value and fileUri simultaneously.
 *
 * @extends AbstractModelType
 *
 * @property {String} value - optional. Text specifying the text to be played or empty if just silence should be played out.
 * @property {String} fileUri - optional. Url of any media file to be played out.
 * @property {String} voice -  CallingModelEnums.VoiceGender, optional. The voice to use to read the text if "value" is text.
 * @property {String} culture - CallingModelEnums.Culture, optional. The culture to use to tts out if "value" is text.
 * @property {Number} silenceLengthInMilliSeconds - optional. Any silence to be played out before playing "value". If "value" is null, this field must be a valid > 0 value.
 * @property {Boolean} emphasize - optional. Whether to emphasize when reading text - if "value" is text.
 * @property {String} sayAs - optional, CallingModelEnums.SayAs. Whether to customize pronunciation when reading text - if "value" is text.
 */
class Prompt extends AbstractModelType
{
    /**
     * Creates a new prompt
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.value = null;
        this.fileUri = null;
        this.voice = null;
        this.culture = null;
        this.silenceLengthInMilliSeconds = null;
        this.emphasize = null;
        this.sayAs = null;

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
        
        var fileUriSpecified = this.fileUri != null;
        var promptTextSpecified = this.value != null && /\S/.test(this.value);
        
        if(!fileUriSpecified && !promptTextSpecified && (this.silenceLengthInMilliSeconds == null || this.silenceLengthInMilliSeconds <= 0))
        {
            errors.push('Neither Prompt.fileUri, Prompt.value or valid silence period are specified');
        }
        
        if(fileUriSpecified && promptTextSpecified)
        {
            errors.push('Prompt.fileUri and Prompt.value must not be specified at the same time');
        }

        if(fileUriSpecified) errors = errors.concat(ModelValidation.validateString(context, this.fileUri, 'Prompt.fileUri', false));
        if(promptTextSpecified) errors = errors.concat(ModelValidation.validateString(context, this.value, 'Prompt.value', false, CallingModelLimits.LengthOfTTSText.Max));

        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.silenceLengthInMilliSeconds,
             'Prompt.silenceLengthInMilliSeconds',null, CallingModelLimits.SilentPromptDurationSec.Max));
        errors = errors.concat(ModelValidation.validateOptionalEnum(context, this.voice, CallingModelEnums.VoiceGender,
            'Prompt.voice'));
        errors = errors.concat(ModelValidation.validateOptionalEnum(context, this.culture, CallingModelEnums.Culture,
            'Prompt.culture'));
        errors = errors.concat(ModelValidation.validateOptionalEnum(context, this.sayAs, CallingModelEnums.SayAs,
            'Prompt.sayAs'));
        errors = errors.concat(ModelValidation.validateOptionalBoolean(context, this.emphasize, 'Prompt.emphasize'));
        
        return errors;      
    }
}

module.exports = Prompt;
