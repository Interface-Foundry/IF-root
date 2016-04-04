'use strict';

var CallingModelLimits = {
    
    RecordingDurationSec : {
        Min: 10,
        Max: 600   
    },

    SilenceTimeoutSec : {
        Min: 1,
        Max: 30   
    },

    InitialSilenceTimeoutSec : {
        Min: 1,
        Max: 30   
    },

    InterDigitTimeoutSec : {
        Min: 1,
        Max: 5   
    },
    
    NumberOfDtmfsExpected: {
        Min: 1,
        Max: 20
    },
    
    NumberOfStopTones: {
        Min: 0,
        Max: 5
    },
    
    NumberOfSpeechVariations: {
        Min: 0,
        Max: 5
    },

    SilentPromptDurationSec: {
        Min: 0,
        Max: 60
    },

    LengthOfTTSText: {
        Min: 0,
        Max: 2048
    },

    AppStateLength: {
        Min: 0,
        Max: 1024
    },

    MaxDownloadedFileSizeBytes: {
        Min: 0,
        Max: 1048576
    },
    
    MediaConfigurationLength: {
        Min: 0,
        Max: 1024
    },
    
    FileDownloadTimeoutSec: {
        Min: 0,
        Max: 10
    }
};

module.exports = CallingModelLimits;