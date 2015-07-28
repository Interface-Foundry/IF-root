// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;
//pull in imgURLs and tags from each snap, and update whenever one is added or removed
var lookSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    description: String,
    lookImg: String,
    lookTags: {
        colors: [],
        categories: [],
        text: []
    },
    status: {
        type: String,
        enum: ['public', 'private']
    },
    views: Number,
    owner: {
        mongoId: {
            type: String,
            index: true
        },
        profileID: String,
        name: String
    },
    faves: [{
        userId: String,
        timeFaved: Date
    }],
    fave_count: Number,
    comments: [{
        user: {
            mongoId: String,
            profileID: String,
            name: String,
            avatar: String
        },
        comment: String,
        timeCommented: Date
    }],
    reports: [{
        reporterUserId: String,
        timeReported: Date,
        comment: String,
        reason: String
    }],
    snaps: [{
        mongoId: {
            type: Schema.Types.ObjectId,
            ref: 'landmarkModel'
        },
        snapOwnerId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        snapURLs: String,
        tags: {
            colors: [],
            categories: [],
            text: []
        }
    }],
    snapIds: [Schema.Types.ObjectId],
    created: {
        type: Date,
        default: Date.now
    }
});

// gets a simple json rep of the look for thumbnails etc
lookSchema.methods.getSimpleLook = function() {
    return {
        mongoId: this._id.toString(),
        id: this.id,
        name: this.name,
        lookImg: this.lookImg
    }
};

module.exports = mongoose.model('look', lookSchema);