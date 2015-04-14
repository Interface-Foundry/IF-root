// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var tweetSchema = mongoose.Schema({
    tweetID: {
        type: Number,
        index: {
            unique: true
        }
    },
    tweetID_str: String,
    user: {
        name: String,
        screen_name: String,
        userId: Number,
        userId_str: String,
        profile_image_url: String
    },
    media: {
        media_type: String,
        media_url: String
    },
    text: {
        type: String,
        index: true
    },
    hashtags: [{
        type: String,
        index: true
    }],

    created: {
        type: Date,
        default: Date.now
    }
    
});

tweetSchema.index({hashtags:1});

module.exports = mongoose.model('tweets', tweetSchema);