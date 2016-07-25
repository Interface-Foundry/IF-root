// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');

var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;


function getRandomAvatar() {

    var avatars = ['https://s3.amazonaws.com/if-server-avatars/0',
        'https://s3.amazonaws.com/if-server-avatars/1',
        'https://s3.amazonaws.com/if-server-avatars/2',
        'https://s3.amazonaws.com/if-server-avatars/3',
        'https://s3.amazonaws.com/if-server-avatars/4'
    ]

    var path = avatars[Math.floor(Math.random() * (4 - 0 + 1)) + 0];
    // console.log('path is:', path)
    return path

}

// define the schema for our user model
var userSchema = mongoose.Schema({

    local: {
        email: {
            type: String,
            index: true
        },
        password: {
            type: String
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        confirmedEmail: {
            type: Boolean,
            default: false
        },
        confirmEmailToken: String,
        confirmEmailExpires: Date
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        verified: Boolean,
        locale: String,
        timezone: Number,
        bio: String
    },
    google: {
        id: String,
        name: String,
        picture: String,
        oauthToken: String,
        idToken: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    meetup: {
        id: String,
        token: String,
        displayName: String,
        raw: String
    },
    auth: {
        confirmedEmail: Boolean,
        lastLogin: Date,
        loginCount: Number
    },
    addr: String, //address 
    addrP: Number,
    addr2: String, //second line
    bday: Number, //birthday
    bdayP: Number,
    lang: String, // ex: ‘EN-us’ 
    avatar: {
       type: String,
       default: getRandomAvatar()
    },
    name: String,
    note: String,
    social: {
        linkedIn: String,
        linkedInP: Number,
        twitter: String,
        twitterP: Number,
        facebook: String,
        facebookP: Number,
        gplus: String,
        gplusP: Number,
        github: String,
        githubP: Number,
    },
    contact: [Schema.Types.Mixed],
    email: {
        type: String
    }, //FORCE LOWERCASE
    emailConfirmed: Boolean,
    tel: String,
    presents: {
        collected: [Schema.Types.Mixed]
    },
    profileID: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
        required: true
    },
    permissions: [{

    }],
    submissions: [{
        worldID: String,
        contestID: String,
        entryID: String,
        imgURL: String,
        timestamp: Date,
        hashtag: String
    }],
    admin: Boolean,
    bubbleRole: [{
        worldId: {
            type: String
        },
        role: {
            type: String,
            default: 'user'
        }
    }],
    faves: [String], // virtual prop of user's "like" collection
    faveLooks: [String],
    rejects: [String], // list of rejected mongoIds here for quicker querying
    recentSearches: {
        searchQuery: {},
        lastTimeSearched: Date,
        tracked: Boolean
    },
    defaultPriceRange: Number,
    defaultSearchRadius: Number,
    following: [String],
    followers: [String],
    snapCount: Number,
    kips: Number,
    description: String,
    location: String
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// returns a simple user json object
userSchema.methods.getSimpleUser = function() {
    return {
        mongoId: this._id.toString(),
        profileID: this.profileID,
        name: this.name,
        avatar: this.avatar
    };
};

// create the model for users and expose it to our app
var User = mongoose.model('User', userSchema);


/**
 * Finds all the users who are mentioned in some text, where a mention is
 * something like "nice dress @peach" where peach is the profileID.
 * @param text example "hello @peach and @bowser89!"
 * @param callback
 */
User.getMentionedUsers = function(text, callback) {
    var profileIDs = []; // example ['peach', 'bowser89']
    var regex = /[\s\w]*@([\w\n]+)[^\w^\n]*/g;

    // find ALL the matches
    var match = regex.exec(text);
    while (match != null) {
        profileIDs.push(match[1]);
        match = regex.exec(text);
    }

    var query = User.find({profileID: {$in: profileIDs}});

    if (typeof callback === 'function') {
        query.exec(callback);
    } else {
        return query.exec();
    }
};

module.exports = User;