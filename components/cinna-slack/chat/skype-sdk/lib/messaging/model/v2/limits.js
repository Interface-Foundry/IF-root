'use strict';

var LimitsV2 = {

    MessageContentSizeBytes : {
        Min: 1,
        Max: 1024000
    },

    AttachmentRequestSize : {
        Min: 1,
        Max: 20971520
    }

};

module.exports = LimitsV2;