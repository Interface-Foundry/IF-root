'use strict';

var EnumsV2 = {

    IncomingActivityType: {
        Attachment: 'attachment',
        ContactRelationUpdate: 'contactRelationUpdate',
        ConversationUpdate: 'conversationUpdate',
        Message: 'message'
    },

    AttachmentType: {
        Image: 'Image',
        Video: 'Video'
    },

    AttachmentViewType : {
        Original : 'original',
        Thumbnail: 'thumbnail'
    },

    ContactRelationAction: {
        Add : 'add',
        Remove : 'remove'
    }
};

module.exports = EnumsV2;