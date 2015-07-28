var app = require('express').Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var db = require('db');
var axios = require('axios');
var secret = 'SlytherinOrGTFO';
var expiresInMinutes = 10 * 365 * 24 * 60; // 10 years

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


/**
 * Populate req.user if possible
 * Uses bearer auth
 * Header:
 *  Authentication
 * Value:
 *  "Bearer [json web token]"
 */
app.use(function(req, res, next) {
    var token = req.headers['authorization'];
    if (!token) {
        return next();
    }

    token = token.split(' ').pop();
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            console.error(err);
            return next();
        }
        if (decoded && decoded.sub) {
            // todo replace with something better than a full-fledged db call
            db.Users.findById(decoded.sub, function(e, u) {
                if (e) {
                    next(e)
                }
                if (u) {
                    req.user = u;
                    req.userId = u._id.toString();
                }
                next();
            });
        }
    });
});

/**
 * Expects {email, password}
 */
app.post('/api/auth/login', function(req, res, next) {
    if (!req.body || !req.body.email || !req.body.password) {
        next("Must pass in {email, password}");
    }

    db.Users.findOne({
            'local.email': req.body.email
        })
        .then(function(user) {
            if (!user) next('Could not find user for that email.')

            bcrypt.compare(req.body.password, user.local.password, function(err, ok) {
                if (err) {
                    return next(err)
                }
                if (!ok) {
                    return next('invalid password');
                }

                res.json({
                    user: user,
                    token: getToken(user)
                });
            });
        }, next);
});

/**
 * Expects {email, password}
 */
app.post('/api/auth/signup', function(req, res, next) {
    if (!req.body || !req.body.email || !req.body.password) {
        next("Must pass in {email, password}");
    }
    var newUser = new db.Users()
    newUser.local.email = req.body.email;
    var salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    var hash = bcrypt.hashSync(req.body.password, salt);
    newUser.local.password = hash;
    newUser.save(function(err, savedUser) {
        if (err || !savedUser) next('Could not create user.')
            console.log('savedUser: ',savedUser)
        res.json({
            user: savedUser,
            token: getToken(savedUser)
        });

    }, next);
});

/**
 * Expects at minimum {data: {userID, name}}
 */
app.post('/api/auth/verify-facebook', function(req, res, next) {
    if (!req.body || !req.body.user || !req.body.user.id || !req.body.auth) {
        return next("Error completing facebook registration or sign-in");
    }

    var fb_token = req.body.auth.authResponse.accessToken;

    axios.get('https://graph.facebook.com/v2.4/me?access_token=' + fb_token)
        .then(function(fb_res) {
            if (fb_res.data.id !== req.body.user.id) {
                throw new Error('Facebook credential mismatch between user ids ' + fb_res.data.id + ' and ' + req.body.user.id);
            }

            return db.Users.findOne({
                'facebook.id': req.body.user.id
            })
        })
        .then(function(user) {
            if (user) {
                return user;
            } else {
                var u = new db.User({
                    facebook: {
                        id: req.body.user.id,
                        name: req.body.user.name
                    },
                    name: req.body.user.name
                });
                return axios.get('https://graph.facebook.com/v2.4/me/picture?redirect=false&height=300&width=300&access_token=' + fb_token)
                    .then(function(pic) {
                        u.avatar = pic.data.data.url;
                        return u.save();
                    });
            }
        })
        .then(function(user) {
            res.json({
                user: user,
                token: getToken(user)
            });
        }, next);
});

/**
 * Expects at minimum {data: {userID, name}}
 */
app.post('/api/auth/verify-google', function(req, res, next) {
    if (!req.body || !req.body.user || !req.body.user.id) {
        return next("Error completing google registration or sign-in");
    }

    db.Users.findOne({
            'google.id': req.body.user.id
        })
        .then(function(user) {
            if (!user) {
                var u = new db.User({
                    google: req.body.user,
                    name: req.body.user.name,
                    avatar: req.body.user.picture
                });
                return u.save(function(err, user) {
                    if (err) {
                        console.error(err);
                    }
                    res.json({
                        user: user,
                        token: getToken(user)
                    });
                });
            }

            res.json({
                user: user,
                token: getToken(user)
            });
        });
});

module.exports = app;