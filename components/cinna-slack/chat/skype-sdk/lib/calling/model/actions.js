'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelEnums = require('./enums');
const CallingModelLimits = require('./limits');
const Prompt = require('./prompt');
const CollectDigits = require('./collect-digits');
const RecognitionOption = require('./recognition-option');
const Dmtfs = require('./dmtfs');
const Participant = require('./participant');

var actionOrdering = {
    'reject' : -2,
    'answer' : 1,
    'answerAppHostedMedia': 1,
    'placeCall': 1,
    'videoSubscription': 1,
    'playPrompt': 2,
    'record': 2,
    'recognize': 2,
    'transfer': 2,
    'hangup': 3    
};

/**
 * Base class for various actions; it must not be instantiated directly
 *
 * @extends AbstractModelType
 *
 * @property {String} operationId - an operation Id needs to be specified by customer so that they can correlate outcome to the action. It becomes necessary when multiple actions are specified in one response body
 * @property {String} action - type of action
 * @property {Boolean} isStandAloneAction - flag to indicate whether this action must not be specified along with any other actions
 * @property {Object} additionalData - optional. Additional arbitrary data
 */
class ActionBase extends AbstractModelType
{
    /**
     * Creates a new ActionBase instance; it is forbidden to call this constructor directly
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super();
        this.isStandAloneAction = isStandAloneAction == null ? false: isStandAloneAction;
        this.operationId = null;
        this.action = null;
        this.additionalData = null;

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
        
        errors = errors.concat(ModelValidation.validateString(context, this.operationId, 'ActionBase.operationId'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.action, CallingModelEnums.ActionType, 'ActionBase.action'));
        errors = errors.concat(ModelValidation.validateGenericObject(context, this.additionalData, 'ActionBase.additionalData'));
        errors = errors.concat(ModelValidation.validateBoolean(context, this.isStandAloneAction, 'ActionBase.isStandAloneAction'));

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should accept the call.
 * The media is hosted by the server call bot
 *
 * @extends ActionBase
 *
 * @property {String[]} AcceptModalityTypes - array of CallingModelEnums.ModalityType; The modality types the application will accept, Audio by default
 */
class Answer extends ActionBase
{
    /**
     * Creates a new Answer action
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and not part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Answer; 
        this.acceptModalityTypes = [ CallingModelEnums.ModalityType.Audio ];

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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Answer)
            errors.push('Answer.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateEnumArray(context, this.acceptModalityTypes, CallingModelEnums.ModalityType,
            'Answer.acceptModalityTypes',
            [CallingModelEnums.ModalityType.Unknown, CallingModelEnums.ModalityType.VideoBasedScreenSharing]));

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should accept the call but that the
 * application will host the media
 *
 * @extends ActionBase
 *
 * @property {Object} mediaConfiguration - opaque object to pass media negotation configuration from the application to the ExecutionAgent
 */
class AnswerAppHostedMedia extends Answer
{
    /**
     * Creates a new AnswerAppHostedMedia action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.AnswerAppHostedMedia;
        this.mediaConfiguration = null;

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

        if(this.type != null && this.type != CallingModelEnums.ActionType.AnswerAppHostedMedia)
            errors.push('AnswerAppHostedMedia.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateGenericObject(context, this.mediaConfiguration, 'AnswerAppHostedMedia.mediaConfiguration', false));
        if(this.mediaConfiguration != null && ModelValidation.checkIfObject(this.mediaConfiguration))
        {
            var stringMediaConfiguration = JSON.stringify(this.mediaConfiguration);
            if(stringMediaConfiguration != null && stringMediaConfiguration.length > CallingModelLimits.MediaConfigurationLength.Max)
            {
                errors.push('AnswerAppHostedMedia.mediaConfiguration exceeds after JSON serialization the maximum allowed length of' + AnswerAppHostedMedia.mediaConfiguration);
            }
        }

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should hangup the call
 *
 * @extends ActionBase
 */
class Hangup extends ActionBase
{
    /**
     * Creates a new Hangup action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Hangup; 
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Hangup)
            errors.push('Hangup.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should place an outgoing call
 *
 * @extends ActionBase
 *
 * @property {Object} source - Participant; MRI for the source of the call
 * @property {Object} target - Participant; MRI of the user to whom the call is to be placed
 * @property {String} subject - optional; subject of the call that is to be placed
 * @property {String} appId - AppId of the customer
 * @property {Number} initiateModalityTypes - optional, default: Audio ; the modality types the application want to present
 */
class PlaceCall extends ActionBase
{

    /**
     * Creates a new PlaceCall action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.PlaceCall;
        this.source = null;
        this.target = null;
        this.subject = null;
        this.initiateModalityTypes = [CallingModelEnums.ModalityType.Audio];
        this.appId = null;

        this.populatePlainInput(inputData, {
            'source': attrData => { return new Participant(attrData); },
            'target': attrData => { return new Participant(attrData); }
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.PlaceCall)
            errors.push('PlaceCall.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateTypedObject(context, this.source, Participant, 'PlaceCall.source', 'Participant'));
        errors = errors.concat(ModelValidation.validateTypedObject(context, this.target, Participant, 'PlaceCall.target', 'Participant'));
        errors = errors.concat(ModelValidation.validateString(context, this.appId, 'PlaceCall.appId'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.subject, 'PlaceCall.subject'));

        errors = errors.concat(ModelValidation.validateEnumArray(context, this.initiateModalityTypes, CallingModelEnums.ModalityType,
            'PlaceCall.initiateModalityTypes',
            [CallingModelEnums.ModalityType.Unknown, CallingModelEnums.ModalityType.VideoBasedScreenSharing]));

        if(this.source != null && !this.source.originator) errors.push('PlaceCall.source must have set originator to true');
        if(this.target != null && this.target.originator) errors.push('PlaceCall.target must have set originator to false');

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should play/tts out prompt(s)
 *
 * @extends ActionBase
 *
 * @property {Object[]} prompts - array of Prompt; List of prompts to play out
 */
class PlayPrompt extends ActionBase
{
    /**
     * Creates a new PlayPrompt action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.PlayPrompt;
        this.prompts = null;

        this.populatePlainInput(inputData, {
            'prompts' : attrData => {return new Prompt(attrData);}
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
        errors = errors.concat(ModelValidation.validateTypedObjectArray(context, this.prompts, Prompt, 'PlayPrompt.prompts', 'Prompt'));
        if(this.type != null && this.type != CallingModelEnums.ActionType.PlayPrompt)
            errors.push('PlayPrompt.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should perform speech or dtmf recognition
 *
 * @extends ActionBase
 *
 * @property {Object} playPrompt - PlayPrompt; PlayPrompt action to be played out (if any) before recognition starts. Customers can choose to specify "playPrompt" action separately or specify as part of "recognize" - mostly all recognitions are preceeded by a prompt
 * @property {Boolean} bargeInAllowed - optional, default: true; specifies whether customers are allowed to enter choice before prompt finishes
 * @property {String} culture - optional, string from CallingModelEnums.Culture, default: EnUs;  culture of Speech Recognizer to use
 * @property {Number} InitialSilenceTimeoutinSeconds - optional, default: 5; Maximum initial silence allowed from the time we start the recognition operation before we timeout and fail the operation (time for the prompt is excluded if any)
 * @property {Number} InterDigitTimeoutInSeconds - optional, default: 1; Maximum allowed time between digits if we are doing dtmf based choice recognition or CollectDigits recognition
 * @property {Object[]} choices - array of RecognitionOption, optional;  list of choices to recognize against. Choices can be speech or dtmf based
 * @property {Object[]} choices - array of CollectDigits, optional;  There is no choice based recognition. Rather collect all digits entered by user. Either CollectDigits or Choices must be specified. Both can not be specified
 */
class Recognize extends ActionBase
{
    /**
     * Creates a new Recognize action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Recognize;
        this.playPrompt = null;
        this.bargeInAllowed = null;
        this.culture = null;
        this.initialSilenceTimeoutInSeconds = null;
        this.interDigitTimeoutInSeconds = null;
        this.choices = null;
        this.collectDigits = null;

        this.populatePlainInput(inputData, {
            'playPrompt' : attrData => new PlayPrompt(attrData),
            'choices' : attrData => new RecognitionOption(attrData),
            'collectDigits' : attrData => new CollectDigits(attrData)
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Recognize)
            errors.push('Recognize.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateOptionalTypedObject(context, this.playPrompt, PlayPrompt, 'Recognize.playPrompt', 'PlayPrompt'));
        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.initialSilenceTimeoutInSeconds,
                      'Recognize.initialSilenceTimeoutInSeconds', CallingModelLimits.InitialSilenceTimeoutSec.Min));
        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.interDigitTimeoutInSeconds,
            'Recognize.interDigitTimeoutInSeconds', CallingModelLimits.InterDigitTimeoutSec.Min));
        errors = errors.concat(ModelValidation.validateOptionalBoolean(context, this.bargeInAllowed,  'Recognize.bargeInAllowed'));
        errors = errors.concat(ModelValidation.validateOptionalEnum(context, this.culture, CallingModelEnums.Culture, 'Recognize.culture'));

        var choiceSpecified = this.choices != null;
        var collectDigitsSpecified = this.collectDigits != null;
        
        if(!choiceSpecified && !collectDigitsSpecified)
        {
            errors.push('Neither Recognize.choices or Recognize.collectDigits is specified');
        }
        else if(choiceSpecified && collectDigitsSpecified)
        {
            errors.push('Both Recognize.choices or Recognize.collectDigits are specified');
        }
        else if(choiceSpecified)
        {
            errors = errors.concat(ModelValidation.validateTypedObjectArray(context, this.choices, RecognitionOption,
                'Recognize.choices', 'RecognitionOption'));
            if(errors.length == 0) errors = errors.concat(this.validateUniquenessOfChoices(context));
        }
        else if(collectDigitsSpecified)
        {
            errors = errors.concat(ModelValidation.validateTypedObject(context, this.collectDigits, CollectDigits,
                          'Recognize.collectDigits', 'CollectDigits'));
        }
        
        return errors;
    }

    /**
     *  validates whether the choice options in Recognize.choices are unique
     *  called automatically as part of validate
     *
     * @returns {Array} - validation errors
     */
    validateUniquenessOfChoices()
    {
        var errors = [];
        var dtmfsChoices = new Set();
        var dtmfsAdded = 0;

        var speechChoices = new Set();
        var speechChoicesAdded = 0;

        for (var i = 0; i < this.choices.length; ++i)
        {
            if (this.choices[i].dtmfVariation != null)
            {
                dtmfsChoices.add(this.choices[i].dtmfVariation);
                ++dtmfsAdded;
            }

            if (this.choices[i].speechVariation != null)
            {
                this.choices[i].speechVariation.forEach(function (item) {
                    speechChoices.add(item);
                    ++speechChoicesAdded;
                });
            }
        }

        if (dtmfsChoices.size != dtmfsAdded)
        {
            errors.push('Some dtmfs choices in the Recognize.choices are not unique');
        }

        if (speechChoices.size != speechChoicesAdded)
        {
            errors.push('Some speech choices in the Recognize.choices are not unique');
        }

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should start recording user speech
 *
 * @extends ActionBase
 *
 * @property {Object} playPrompt - PlayPrompt; PlayPrompt action to be played (if any) before recognition starts. Customers can choose to specify "playPrompt" action separately or specify as part of "recognize" - mostly all recognitions are preceeded by a prompt
 * @property {Number} maxDurationInSeconds - optional, default: 180; maximum duration of recording
 * @property {Number} InitialSilenceTimeoutInSeconds - optional, default: 5; Maximum initial silence allowed from the time we start the recognition operation before we timeout and fail the operation (time for the prompt is excluded if any)
 * @property {Number} maxSilenceTimeoutInSeconds - optional, default: 1; Maximum allowed silence once the user has started speaking before we conclude the user is done recording
 * @property {String} recordingFormat - optional, string from CallingModelEnums.RecordingFormat, default: Wma;  the format is which the recording is expected
 * @property {Boolean} transcribe - optional, default: false; if specified "true", then we would attempt to transcribe the recording.
 * @property {Boolean} playBeep - optional, true: false; If specified "true", then we would play a beep before starting recording operation
 * @property {String[]} stopTones - optional, array of dtmfs chars; stop patterns which users can punch to end recording
 */
class Record extends ActionBase
{
    /**
     * Creates a new Record action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Record;
        this.playPrompt = null;
        this.maxDurationInSeconds = null;
        this.initialSilenceTimeoutInSeconds = null;
        this.maxSilenceTimeoutInSeconds = null;
        this.recordingFormat = null;
        this.transcribe = null;
        this.playBeep = null;
        this.stopTones = null;

        this.populatePlainInput(inputData, {
            'playPrompt': attrData => {
                return new PlayPrompt(attrData);
            }
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Record)
            errors.push('Record.type is set to invalid value ' + this.type);

        if(this.stopTones != null)
        {
            errors = errors.concat(Dmtfs.validateDtmfsArray(context, this.stopTones, 'Record.stopTones'));
        }

        errors = errors.concat(ModelValidation.validateOptionalTypedObject(context, this.playPrompt, PlayPrompt, 'Record.playPrompt', 'PlayPrompt'));

        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.maxDurationInSeconds,
            'Record.maxDurationInSeconds', CallingModelLimits.RecordingDurationSec.Min, CallingModelLimits.RecordingDurationSec.Max));
        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.initialSilenceTimeoutInSeconds,
            'Record.initialSilenceTimeoutInSeconds', CallingModelLimits.InitialSilenceTimeoutSec.Min, CallingModelLimits.InitialSilenceTimeoutSec.Max));
        errors = errors.concat(ModelValidation.validateOptionalNumber(context, this.maxSilenceTimeoutInSeconds,
            'Record.maxSilenceTimeoutInSeconds', CallingModelLimits.SilenceTimeoutSec.Min, CallingModelLimits.SilenceTimeoutSec.Max));
        errors = errors.concat(ModelValidation.validateOptionalBoolean(context, this.transcribe, 'Record.transcribe'));
        errors = errors.concat(ModelValidation.validateOptionalBoolean(context, this.playBeep, 'Record.playBeep'));
        errors = errors.concat(ModelValidation.validateOptionalEnum(context, this.recordingFormat, CallingModelEnums.RecordingFormat, 'Record.recordingFormat'));

        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should reject the call
 *
 * @extends ActionBase
 */
class Reject extends ActionBase
{
    /**
     * Creates a new Reject action instance
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Reject; 
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Reject)
            errors.push('Reject.type is set to invalid value ' + this.type);
        return errors;
    }
}

/**
 * This is the action which customers can specify to indicate that the server call bot should transfer established
 * call. The transfer is attended - meaning if the transfer fails the bot is able to still interact with caller.
 * If transfer succeeds the call is automatically hang up.
 *
 * @extends ActionBase
 *
 * @property {Object} target - Participant class; new call recipient
 */
class Transfer extends ActionBase
{
    /**
     * Creates a new Transfer action
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.action = CallingModelEnums.ActionType.Transfer;
        this.target = null;

        this.populatePlainInput(inputData, {
            'target' : attrData => {return new Participant(attrData);}});
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

        if(this.type != null && this.type != CallingModelEnums.ActionType.Transfer)
            errors.push('Transfer.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateTypedObject(context, this.target, Participant, 'Transfer.target', 'Participant'));
        if(errors.length == 0)
        {
            if(this.target.identity != null &&  !this.target.identity.startsWith('8:'))
            {
                errors.push('Transfer.target identity must be user skype id, i.e. in form 8:<id>');
            }
            if(this.target.originator != null && this.target.originator == true)
            {
                errors.push('Transfer.target originator must be set to false');
            }
        }
        
        return errors;
    }
}

/**
 * This is the action that is used for video subscription whatever it is
 *
 * @extends ActionBase
 *
 * @property {String} appState - optional. Opaque string to facilitate app developers to pass their custom data in this field back in the response
 * @property {Number} socketId - sequence ID of video socket. Index from 0-9
 * @property {String} participantIdentity - optional, default: null; identity of the participant whose video is pinned if VideoMode is set to manual
 * @property {String} videoResolution - optional, string from CallingModelEnums.ResolutionFormat, default: Sd360p;  indicates the video resolution format
 * @property {String} videoModality - optional, string from CallingModelEnums.ModalityType, default: Unknown;  indicates whether the video is from the camera or from screen sharing
 * @property {String} videoSubscriptionMode - optional, string from CallingModelEnums.VideoSubscriptionMode, default: Manual;  videoMode indicates whether the socket is pinned to a particular participant
 */
class VideoSubscription extends ActionBase
{
    /**
     * Creates a new VideoSubscription action
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     * @param {Object} isStandAloneAction - true if the action is isolated and must not be part of the action list
     */
    constructor(inputData, isStandAloneAction)
    {
        super(inputData, isStandAloneAction);
        this.appState = null;
        this.socketId = null;
        this.participantIdentity = null;
        this.videoSubscriptionMode = CallingModelEnums.VideoSubscriptionMode.Manual;
        this.videoModality = CallingModelEnums.ModalityType.Unknown;
        this.videoResolution = CallingModelEnums.ResolutionFormat.Sd360p;
        this.action = CallingModelEnums.ActionType.VideoSubscription;

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

        if(this.type != null && this.type != CallingModelEnums.ActionType.VideoSubscription)
            errors.push('VideoSubscription.type is set to invalid value ' + this.type);

        errors = errors.concat(ModelValidation.validateNumber(context, this.socketId, 'VideoSubscription.socketId', 0, 9));
        errors = errors.concat(ModelValidation.validateEnum(context, this.videoResolution, CallingModelEnums.ResolutionFormat,
                      'VideoSubscription.videoResolution'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.videoSubscriptionMode, CallingModelEnums.VideoSubscriptionMode,
                      'VideoSubscription.videoSubscriptionMode'));
        errors = errors.concat(ModelValidation.validateEnum(context,this.videoModality, CallingModelEnums.ModalityType,
                      'VideoSubscription.videoModality', [ CallingModelEnums.ModalityType.Audio ]));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.appState, 'VideoSubscription.appState', true, CallingModelLimits.AppStateLength.Max));

        if(this.videoSubscriptionMode == CallingModelEnums.VideoSubscriptionMode.Manual)
        {
            errors = errors.concat(ModelValidation.validateString(context, this.participantIdentity, 'VideoSubscription.participantIdentity', false));
            if(this.videoModality == CallingModelEnums.ModalityType.Unknown) errors.push('VideoSubscription.videoModality cannot be set Unknown with videoSubscriptionMode=Manual');
        }

        if(this.videoSubscriptionMode == CallingModelEnums.VideoSubscriptionMode.Auto)
        {
            if(this.participantIdentity != null) errors.push('VideoSubscription.participantIdentity must not be set with videoSubscriptionMode=Auto');
            if(this.videoModality != CallingModelEnums.ModalityType.Unknown) errors.push('VideoSubscription.videoModality must be set to Unknown with videoSubscriptionMode=Auto');
        }

        return errors;
    }
}

/**
 *  validates ordered list of actions
 *
 * @param {Object} context - validation context
 * @param {Object[]} actionArray - array of actions
 * @param {String} actionArrayName - optional name of the actions array to be used for validation error texts
 *
 * @returns {String[]} - validation errors
 * 
 * @ignore
 */
function validateActionArray(context, actionArray, actionArrayName)
{
    if(actionArrayName == null) actionArrayName = 'Action array';

    var errors = ModelValidation.validateTypedObjectArray(context, actionArray, ActionBase, actionArrayName, 'ActionBase');
    if(errors.length > 0) return errors;

    if(actionArray.length == 1) return errors;

    var actionNamesSet = new Set();
    actionArray.forEach(item => actionNamesSet.add(item.action));

    // standalone action must not be part of the action list unless it is the only one on the list
    actionArray.forEach(function (item)
    {
        if (item.isStandAloneAction) errors.push(
            'Standalone action of type ' + item.action + ' must not be specified with other actions in ' + actionArrayName);
    });

    // make sure there are no duplicities
    if(actionNamesSet.size != actionArray.length)
    {
        errors.push('Some action types are used multiple times in the ' + actionArrayName);
    }

    // make sure answer and place call actions are not used together
    if(actionNamesSet.has(CallingModelEnums.ActionType.Answer) && actionNamesSet.has(CallingModelEnums.ActionType.PlaceCall))
    {
        errors.push('Answer and PlaceCall must not appear together in ' + actionArrayName);
    }

    // make sure that the actions are used in correct order
    var currentOrderValue = actionOrdering[actionArray[0].action];
    var initialSign = Math.sign(currentOrderValue);
    for (var i = 1; i < actionArray.length; ++i)
    {
        var nextOrderValue = actionOrdering[actionArray[i].action];
        if(nextOrderValue < currentOrderValue || initialSign != Math.sign(nextOrderValue))
        {
            errors.push('Actions ' + actionArray[i-1].action  + ' and ' + actionArray[i].action + ' are not in proper order in ' + actionArrayName);
        }
        currentOrderValue = nextOrderValue;
    }

    return errors;
}

/**
 * instantiates proper action class object from the passed generic object
 *
 * @param {Object} actionData - object, possibly the relevant part of deserialized JSON received from the Calling service
 * @param {Object} isStandAloneAction - true if the resulting action should be isolated and must not be part of the action list
 *
 * @returns {Object} appropriate instance of ActionBase extending class
 *
 * @throws Error if actionData are null, actionData.action is not set or is not from CallingModelEnums.ActionType
 */
function instantiateAction(actionData, isStandAlone)
{
    if(actionData == null)
    {
        throw new Error('action data are null');
    }
    else if(typeof actionData  != 'object' || Array.isArray(actionData))
    {
        throw new Error('Invalid type of the action data');
    }
    else if(actionData.action == null)
    {
        throw new Error('action attribute in the action data is undefined or null');
    }

    if(isStandAlone == null) isStandAlone = false;

    switch(actionData.action)
    {
    case CallingModelEnums.ActionType.Answer:
        return new Answer(actionData, isStandAlone);

    case CallingModelEnums.ActionType.AnswerAppHostedMedia:
        return new AnswerAppHostedMedia(actionData, isStandAlone);

    case CallingModelEnums.ActionType.Hangup:
        return new Hangup(actionData, isStandAlone);

    case CallingModelEnums.ActionType.PlaceCall:
        return new PlaceCall(actionData, isStandAlone);

    case CallingModelEnums.ActionType.PlayPrompt:
        return new PlayPrompt(actionData, isStandAlone);

    case CallingModelEnums.ActionType.Recognize:
        return new Recognize(actionData, isStandAlone);

    case CallingModelEnums.ActionType.Record:
        return new Record(actionData, isStandAlone);

    case CallingModelEnums.ActionType.Reject:
        return new Reject(actionData, isStandAlone);

    case CallingModelEnums.ActionType.Transfer:
        return new Transfer(actionData, isStandAlone);

    case CallingModelEnums.ActionType.VideoSubscription:
        return new VideoSubscription(actionData, isStandAlone);
    }

    throw new Error('Unsupported ' + actionData.action + ' action in the action data');
}

module.exports = {
    ActionBase,
    Answer,
    AnswerAppHostedMedia,
    Hangup,
    PlaceCall,
    PlayPrompt,
    Recognize,
    Record,
    Reject,
    Transfer,
    VideoSubscription,
    validateActionArray,
    instantiateAction
};
