// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAvatar() {
    var avatars = ['http://portraitdrawer.com/wp-admin/images/Justavatar_9147/AVATARsample14.jpg',
        'http://www.niksebastian.com/wp-content/uploads/2014/05/sample-2-sm.jpg',
        'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ5W6gu6zhgD9Oj9_3VGZrx_G3xGyqmfq_9If_0yAnwoYovT-V3f4spuA',
        'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRIE427i4fX08SSIIbbRwDozyadeldQ5W8kDGAbPXkOgzKb1lHkoA',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh3L5LU5g-AKDRhCje_my0LRaaf90vFrelaD3fQyE5TQQAzfUshg'
    ]
    var avatar = avatars[Math.floor(Math.random() * (4 - 0 + 1)) + 0];
    console.log(avatar.toString());
    return avatar
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
        type: String,
        unique: true,
        lowercase: true
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
        index: true
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
    }]
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);