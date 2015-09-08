var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var secret = 'SlytherinOrGTFO';
var expiresInMinutes = 10 * 365 * 24 * 60; // 10 years

// Use the same authentication as regular kip
//app.use('/', require('../../components/IF_auth/new_auth'));

// Use cookie session ids
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

// get the reset page
// will be something like https://kipapp.co/styles/resetpassword/peter.m.brandt@gmail.com/somereallylonganduniquetoken
app.get('/*', function(req, res, next) {
    res.sendfile(__dirname + '/resetPassword.html');
});

app.post('/reset', function (req, res, next) {
    console.log(req.body);
    if (req.body && req.body.email && req.body.password  && req.body.token) {
        console.log('resetting password for user', req.body.email);
    } else {
        console.log('could not reset password, some field was missing');
        return next('Could not reset password, please try again');
    }

    db.Users.findOne({
        'local.email': req.body.email
    }, function(e, u) {
        if (e) { return next(e) }
        if (!u) { return next('Could not reset password, invalid email')}
        if (u.local.resetPasswordToken !== req.body.token) {
            return next('Could not reset password.  Make sure you are using the most recent link we sent you (and that you copy/pasted it correctly if you had to).  Note that each link can only be used once.');
        }
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        u.local.password = hash;
        u.local.resetPasswordToken = '';
        u.save(function(err, savedUser) {
            if (err || !savedUser) {
                return next('Could not create user.')
            }
            console.log('savedUser: ', savedUser)
            var token = getToken(savedUser);
            res.cookie('kipAuth', token);
            res.json({
                user: savedUser,
                token: token
            });
        })


    })
})


/**
 * Creates a json web token for a user
 * @param user
 */
var getToken = function(user) {
    var jwtUser = {
        sub: user._id.toString(),
        name: user.name
    };

    return jwt.sign(jwtUser, secret, {
        expiresInMinutes: expiresInMinutes
    });
};

if (!module.parent) {
    app.listen(8081, function() {
        console.log('app listening on port 8081');
    })
} else {
    module.exports = app;
}