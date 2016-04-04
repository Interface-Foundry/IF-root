'use strict';

var CallingModelEnums = {
    
    EventType: {
        IncomingCall: 'incomingCall',
        CallStateChange: 'callStateChange',
        AnswerOutcome: 'answerOutcome',
        HangupOutcome: 'hangupOutcome',
        PlayPromptOutcome: 'playPromptOutcome',
        RecognizeOutcome: 'recognizeOutcome',
        RecordOutcome: 'recordOutcome',
        RejectOutcome: 'rejectOutcome',
        WorkflowValidationOutcome: 'workflowValidationOutcome'
    },
    
    ActionType: {
        Answer : 'answer',
        AnswerAppHostedMedia : 'answerAppHostedMedia',
        Hangup : 'hangup',
        PlayPrompt: 'playPrompt',
        Record : 'record',
        Recognize : 'recognize',
        Reject: 'reject',
        PlaceCall: 'placeCall',
        VideoSubscription: 'videoSubscription',
        Transfer: 'transfer'
    },
    
    CallState: {
        Idle: 'idle',
        Incoming: 'incoming',
        Establishing: 'establishing',
        Established: 'established',
        Hold: 'hold',
        Unhold: 'unhold',
        Transferring: 'transferring',
        Redirecting: 'redirecting',
        Terminating: 'terminating',
        Terminated: 'terminated'
    },
    
    Confidence: {
        High: 'high',
        Medium: 'medium',
        Low: 'low'
    },
    
    Culture : {
        EnUs: 'en-US'
    },
    
    DigitalCollectionCompletionReason : {
        InitialSilenceTimeout: 'initialSilenceTimeout',
        InterDigitTimeout: 'interDigitTimeout',
        CompletedStopToneDetected: 'completedStopToneDetected',
        CallTerminated: 'callTerminated',
        TemporarySystemFailure: 'temporarySystemFailure'        
    },
    
    ModalityType : {
        Unknown: 'unknown',
        Audio: 'audio',
        Video: 'video',
        VideoBasedScreenSharing : 'videoBasedScreenSharing'
    },
    
    MultiPartConstants : {
        RecordingContentDispositionName : 'recordedAudio',
        ResultContentDispositionName : 'conversationResult',
        WavMimeType : 'audio/wav',
        WmaMimeType : 'audio/x-ms-wma',
        Mp3MimeType : 'audio/mpeg'
    },
    
    NotificationType: {
        RosterUpdate: 'rosterUpdate',
        CallStateChange: 'callStateChange'
    },
    
    Outcome: {
        Success: 'success',
        Failure: 'failure'
    },
    
    OutcomeType: {
        AnswerOutcome : 'answerOutcome',
        AnswerAppHostedMediaOutcome : 'answerAppHostedMediaOutcome',
        HangupOutcome : 'hangupOutcome',
        RejectOutcome : 'rejectOutcome',
        PlaceCallOutcome : 'placeCallOutcome',
        PlayPromptOutcome : 'playPromptOutcome',
        RecordOutcome : 'recordOutcome',
        RecognizeOutcome : 'recognizeOutcome',
        WorkflowValidationOutcome : 'workflowValidationOutcome',
        VideoSubscriptionOutcome : 'videoSubscriptionOutcome',
        TransferOutcome : 'transferOutcome'
    },
    
    RecognitionCompletionReason: {
        InitialSilenceTimeout: 'initialSilenceTimeout',
        InCorrectDtmf: 'inCorrectDtmf',
        InterDigitTimeout: 'interDigitTimeout',
        SpeechOptionMatched: 'speechOptionMatched',
        DtmfOptionMatched: 'dtmfOptionMatched',
        CallTerminated: 'callTerminated',
        TemporarySystemFailure: 'temporarySystemFailure'
    },
    
    RecordingCompletionReason: {
        InitialSilenceTimeout: 'initialSilenceTimeout',
        MaxRecordingTimeout: 'maxRecordingTimeout',
        CompletedSilenceDetected: 'completedSilenceDetected',
        CompletedStopToneDetected: 'completedStopToneDetected',
        CallTerminated: 'callTerminated',
        TemporarySystemFailure: 'temporarySystemFailure' 
    },
    
    RecordingFormat: {
        Wma: 'wma',
        Wav: 'wav',
        Mp3: 'mp3'
    },
    
    ResolutionFormat: {
        Sd360p: 'sd360p',
        Sd540p: 'sd540p',
        Hd720p: 'hd720p',
        Hd1080p : 'hd1080p'
    },
    
    SayAs : {
        YearMonthDay: 'yearMonthDay',
        MonthDayYear: 'monthDayYear',
        DayMonthYear: 'dayMonthYear',
        YearMonth: 'yearMonth',
        MonthYear: 'monthYear',
        MonthDay: 'monthDay',
        DayMonth: 'dayMonth',
        Day: 'day',
        Month: 'month',
        Year: 'year',
        Cardinal: 'cardinal',
        Ordinal: 'ordinal',
        Letters: 'letters',
        Time12: 'time12',
        Time24: 'time24',
        Telephone: 'telephone',
        Name: 'name',
        PhoneticName: 'phoneticName'
    },
    
    TranscriptionCompletionReason : {
        SuccessfulTranscription: 'successfulTranscription',
        ExceedsRecordingLimit: 'exceedsRecordingLimit',
        CallTerminated: 'callTerminated',
        TemporarySystemFailure: 'temporarySystemFailure'
    },

    VideoSubscriptionMode : {
        Manual : 'manual',
        Auto: 'auto'
    },
    
    VoiceGender : {
        Male : 'male',
        Female: 'female'
    }
    
};

module.exports = CallingModelEnums;
