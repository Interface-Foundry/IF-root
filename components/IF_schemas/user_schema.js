// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;


// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : { type: String, index: true },
        password     : { type: String },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        confirmedEmail: { type: Boolean, default: false },
        confirmEmailToken: String,
        confirmEmailExpires: Date
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    meetup           : {
        id           : String,
        token        : String,
        displayName  : String,
        raw          : String
    },
    auth: {
        confirmedEmail : Boolean,
        lastLogin: Date,
        loginCount: Number
    },
    addr: String, //address 
    addrP: Number,
    addr2: String, //second line
    bday: Number, //birthday
    bdayP: Number,
    lang: String, // ex: ‘EN-us’ 
    avatar: String,
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
    email: {type: String, unique: true, lowercase:true}, //FORCE LOWERCASE
    emailConfirmed: Boolean,
    tel: String,
    presents: {
        collected:[Schema.Types.Mixed]
    },
    profileID: { type: String, index: true}, 
    permissions: [{
        
    }],
    admin: Boolean,
    bubbleRole: [{  
        worldId: {type: String},
        role: {type: String, default: 'user'}
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
