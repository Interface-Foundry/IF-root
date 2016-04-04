'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelEnums = require('./enums');
const DmftsValidation = require('./dmtfs');

/**
 * This base class has set of properties common to all the operation results
 * it must not be instantiated directly
 *
 * @extends AbstractModelType
 *
 * @property {String} id - the operation id which was specified when customer specified an action
 * @property {String} type - string from CallingModelEnums.OutcomeType. Outcome type identifier
 * @property {String} outcome - string from CallingModelEnums.Outcome. Outcome of the operation
 * @property {String} failureReason - optional.  Reason for failure outcome if any
 */
class OperationOutcomeBase extends AbstractModelType
{
    /**
     * Creates a new OperationOutcomeBase instance; it is forbidden to call the constructor directly
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.type = null;
        this.id = null;
        this.outcome = null;
        this.failureReason = null;

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

        errors = errors.concat(ModelValidation.validateString(context, this.id, 'OperationOutcomeBase.id'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.type, CallingModelEnums.OutcomeType, 'OperationOutcomeBase.type'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.outcome, CallingModelEnums.Outcome, 'OperationOutcomeBase.outcome'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.failureReason, 'OperationOutcomeBase.failureReason'));
    
        return errors;      
    }
}

/**
 * This class is result of the answerAppHostedMedia action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 */
class AnswerAppHostedMediaOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new AnswerAppHostedMediaOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.AnswerAppHostedMediaOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.AnswerAppHostedMediaOutcome)
            errors.push('AnswerAppHostedMediaOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This class is result of the answer action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 */
class AnswerOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new AnswerOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.AnswerOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.AnswerOutcome)
            errors.push('AnswerOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This class is result of the hangup action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 */
class HangupOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new HangupOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.HangupOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.HangupOutcome)
            errors.push('HangupOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This class is result of the placeCall action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 * @property {String[]} acceptedModalityTypes - CallingModelEnums.ModalityType; different modalities which were accepted by the remote end
  */
class PlaceCallOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new PlaceCallOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.PlaceCallOutcome;
        this.acceptedModalityTypes = null;

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
        var errors = super.validate(context);

        if(this.type != null && this.type != CallingModelEnums.OutcomeType.PlaceCallOutcome)
            errors.push('PlayPromptOutcome.type is set to invalid value ' + this.type);

        if(this.outcome != null && this.outcome == CallingModelEnums.Outcome.Success)
        {

            errors = errors.concat(ModelValidation.validateEnumArray(context, this.acceptedModalityTypes,
                  CallingModelEnums.ModalityType, 'PlaceCallOutcome.acceptedModalityTypes'));
        }
    
        return errors;
    }
}

/**
 * This class is result of the playPrompt action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 * @property {String[]} acceptedModalityTypes - CallingModelEnums.ModalityType; different modalities which were accepted by the remote end
 */
class PlayPromptOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new PlayPromptOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.PlayPromptOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.PlayPromptOutcome)
            errors.push('PlayPromptOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This is a part of the "recognize" action outcome. This is specified if the customer had specified any recognition options.
 *
 * @extends AbstractModelType
 *
 * @property {String} completionReason - CallingModelEnums.RecognitionCompletionReason; completion reason of the recognition operation
 * @property {string} choiceName - choice that was recognized (if any)
 */
class ChoiceOutcome extends AbstractModelType
{
    /**
     * Creates a new ChoiceOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.completionReason = null;
        this.choiceName = null;

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
        var errors = ModelValidation.validateEnum(context, this.completionReason,
                       CallingModelEnums.RecognitionCompletionReason, 'ChoiceOutcome.completionReason');
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.choiceName, 'ChoiceOutcome.choiceName'));
        return errors;
    }  
}

/**
 * This is a part of the "recognize" action outcome. This is specified if the customer had specified any collectDigits operation
 *
 * @extends AbstractModelType
 *
 * @property {String} completionReason - CallingModelEnums.DigitCollectionCompletionReason; completion reason of the recognition operation
 * @property {string} digits - digits collected (if any)
 */
class CollectDigitsOutcome extends AbstractModelType
{
    /**
     * Creates a new CollectDigitsOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.completionReason = null;
        this.digits = null;

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
        var errors = ModelValidation.validateEnum(context, this.completionReason, CallingModelEnums.DigitalCollectionCompletionReason, 'CollectDigitsOutcome.completionReason');
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.digits, 'CollectDigitsOutcome.digits'));
        
        return errors;
    }  
}

/**
 * This class is result of the recognize action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 * @property {ChoiceOutcome} [choiceOutcome] - The result of the choice based recognition if specified in the original action.
 * @property {CollectDigitsOutcome} [collectDigitsOutcome] - The result of the collectDigits recognition if specified in the original action.
 */
class RecognizeOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new RecognizeOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.RecognizeOutcome;
        this.choiceOutcome = null;
        this.collectDigitsOutcome = null;

        this.populatePlainInput(inputData, {
            'choiceOutcome': outcome => new ChoiceOutcome(outcome),
            'collectDigitsOutcome': outcome => new CollectDigitsOutcome(outcome)
        });
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.RecognizeOutcome)
            errors.push('RecognizeOutcome.type is set to invalid value ' + this.type);
        
        if(this.outcome != null && this.outcome == CallingModelEnums.Outcome.Success)
        {
            var isChoiceOutcome = this.choiceOutcome !== null;
            var isCollectDigitsOutcome = this.collectDigitsOutcome !== null;

            if(isChoiceOutcome && isCollectDigitsOutcome)
            {
                errors.push('Both RecognizeOutcome.choiceOutcome and RecognizeOutcome.collectDigitsOutcome are set');
            }
            else if(!(isChoiceOutcome || isCollectDigitsOutcome))
            {
                errors.push('Neither RecognizeOutcome.choiceOutcome or RecognizeOutcome.collectDigitsOutcome is set');
            }
            else
            {
                if(isChoiceOutcome)
                {
                    errors = errors.concat(ModelValidation.validateTypedObject(context, this.choiceOutcome, ChoiceOutcome, 'RecognizeOutcome.choiceOutcome', 'ChoiceOutcome'));
                }
                
                if(isCollectDigitsOutcome)
                {
                    errors = errors.concat(ModelValidation.validateTypedObject(context, this.collectDigitsOutcome, CollectDigitsOutcome, 'RecognizeOutcome.collectDigitsOutcome', 'CollectDigitsOutcome'));
                    if(this.collectDigitsOutcome != null && typeof this.collectDigitsOutcome.digits == 'string' && this.collectDigitsOutcome.digits.length > 0)
                        errors = errors.concat(DmftsValidation.validateDtmfsArray(context, this.collectDigitsOutcome.digits.split(''), 'RecognizeOutcome.collectDigitsOutcome'));
                }
            }
        }
    
        return errors;
    }
}

/**
 * If transcription was requested in the "record" action, this is the outcome included in the "recordOutcome"
 *
 * @extends AbstractModelType
 *
 * @property {String} outcome - string from CallingModelEnums.Outcome. Outcome of the operation
 * @property {String} completionReason - CallingModelEnums.TranscriptionCompletionReason; completion reason of the record operation
 * @property {String} text - text transcription if the recognize action was successful
 * @property {Boolean} hasProfanity - if the transcription text has profane words tagged by 'profane' tag
 * @property {String} confidence - string from CallingModelEnums.Confidence. Confidence of the transcription if successful
 */
class TranscriptionOutcome extends AbstractModelType
{
    /**
     * Creates a new TranscriptionOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.outcome = null;
        this.completionReason = null;
        this.text = null;
        this.hasProfanity = false;
        this.confidence = CallingModelEnums.Confidence.High;

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
        var errors = ModelValidation.validateBoolean(context, this.hasProfanity, 'TranscriptionOutcome.hasProfanity');
        errors = errors.concat(ModelValidation.validateEnum(context, this.outcome, CallingModelEnums.Outcome, 'TranscriptionOutcome.outcome'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.completionReason, CallingModelEnums.TranscriptionCompletionReason, 'TranscriptionOutcome.completionReason'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.confidence, CallingModelEnums.Confidence, 'TranscriptionOutcome.confidence'));

        if(this.outcome != null && this.outcome == CallingModelEnums.Outcome.Success)
        {
            errors = errors.concat(ModelValidation.validateString(context, this.text, 'TranscriptionOutcome.text'));
        }
        else
        {
            if(this.text != null) errors.push('TranscriptionOutcome.text must not be set when outcome is failure');
        }
        
        return errors;
    }  
}

/**
 * This class is result of the record action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 *
 * @property {String} outcome - string from CallingModelEnums.Outcome. Outcome of the operation
 * @property {String} completionReason - CallingModelEnums.RecordingCompletionReason; completion reason of the record operation
 * @property {Number} lengthOfRecordingInSecs - if recording was successful, this indicates length of recorded audio
 * @property {Object} transcription - TranscriptionOutcome class; if transcription was requested, this indicates transcription outcome
 */
class RecordOutcome extends OperationOutcomeBase
{

    /**
     * Creates a new RecordOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.RecordOutcome;
        this.completionReason = null;
        this.lengthOfRecordingInSecs = null;
        this.transcription = null;

        this.populatePlainInput(inputData, {
            'transcription' : attrData =>{return new TranscriptionOutcome(attrData);}
        });
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.RecordOutcome)
            errors.push('RecordOutcome.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateEnum(context, this.completionReason, CallingModelEnums.RecordingCompletionReason, 'RecordOutcome.completionReason'));

        if(this.outcome != null && this.outcome == CallingModelEnums.Outcome.Success)
        {
            errors = errors.concat(ModelValidation.validateNumber(context, this.lengthOfRecordingInSecs, 'RecordOutcome.lengthOfRecordingInSecs', 1));
            errors = errors.concat(ModelValidation.validateOptionalTypedObject(context, this.transcription, TranscriptionOutcome, 'RecordOutcome.transcription', 'TranscriptionOutcome'));
        }
        else
        {
            errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.lengthOfRecordingInSecs, 'RecordOutcome.lengthOfRecordingInSecs', null, 0));
            if(this.transcription != null) errors.push('RecordOutcome.transcription must not be set when outcome is failure');
        }

        return errors;
    }
}

/**
 * This class is result of the reject action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 */
class RejectOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new RejectOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.RejectOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.RejectOutcome)
            errors.push('RejectOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This class is result of the transfer action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 */
class TransferOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new TransferOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.TransferOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.TransferOutcome)
            errors.push('TransferOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This class is result of the videoSubscription action returned back to the customer CallBack url
 *
 * @extends OperationOutcomeBase
 */
class VideoSubscriptionOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new VideoSubscriptionOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.VideoSubscriptionOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.VideoSubscriptionOutcome)
            errors.push('VideoSubscriptionOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * If the customer's "response" fails validation, this is the outcome conveyed to the customer CallBack Url
 *
 * @extends OperationOutcomeBase
 */
class WorkflowValidationOutcome extends OperationOutcomeBase
{
    /**
     * Creates a new WorkflowValidationOutcome instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.type = CallingModelEnums.OutcomeType.WorkflowValidationOutcome; 
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = super.validate(context);
        if(this.type != null && this.type != CallingModelEnums.OutcomeType.WorkflowValidationOutcome)
            errors.push('WorkflowValidationOutcome.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * instantiates proper operation outcome class object from the passed generic object
 *
 * @param {Object} outcomeData - object, possibly the relevant part of deserialized JSON received from the Calling service
 * @returns {Object} appropriate instance of OperationOutcomeBase extending class
 *
 * @throws Error if outcomeData are null, outcomeData.type is not set or is not from CallingModelEnums.OutcomeType
 */
function instantiateOperationOutcome(outcomeData)
{
    if(outcomeData == null)
    {
        throw new Error('outcome data are null');
    }
    else if(typeof outcomeData  != 'object' || Array.isArray(outcomeData))
    {
        throw new Error('Invalid type of the outcome data');
    }
    else if(outcomeData.type == null)
    {
        throw new Error('type attribute in the outcome data is undefined or null');
    }

    switch(outcomeData.type)
    {
    case CallingModelEnums.OutcomeType.AnswerAppHostedMediaOutcome:
        return new AnswerAppHostedMediaOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.AnswerOutcome:
        return new AnswerOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.HangupOutcome:
        return new HangupOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.PlaceCallOutcome:
        return new PlaceCallOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.PlayPromptOutcome:
        return new PlayPromptOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.RecognizeOutcome:
        return new RecognizeOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.RecordOutcome:
        return new RecordOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.RejectOutcome:
        return new RejectOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.TransferOutcome:
        return new TransferOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.VideoSubscriptionOutcome:
        return new VideoSubscriptionOutcome(outcomeData);

    case CallingModelEnums.OutcomeType.WorkflowValidationOutcome:
        return new WorkflowValidationOutcome(outcomeData);
    }

    throw new Error('Unsupported ' + outcomeData.type + ' outcome type in the outcome data');
}

module.exports = { 
    OperationOutcomeBase,
    AnswerAppHostedMediaOutcome,
    AnswerOutcome,
    HangupOutcome,
    PlaceCallOutcome,
    PlayPromptOutcome,
    RecognizeOutcome,
    ChoiceOutcome,
    CollectDigitsOutcome,
    RecordOutcome,
    TranscriptionOutcome,
    RejectOutcome,
    TransferOutcome,
    VideoSubscriptionOutcome,
    WorkflowValidationOutcome,
    instantiateOperationOutcome
};
