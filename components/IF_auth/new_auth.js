var app = require('express').Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var db = require('db');
var secret = 'SlytherinOrGTFO';
var expiresInMinutes = 10*365*24*60; // 10 years

/**
 * Creates a json web token for a user
 * @param user
 */
var getToken = function(user) {
    var jwtUser = {
        sub: user._id.toString(),
        name: user.name
    };

    return jwt.sign(jwtUser, secret, {expiresInMinutes: expiresInMinutes});
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
        if (err) { next(err); }
        if (decoded && decoded.sub) {
            // todo replace with something better than a full-fledged db call
            db.Users.findById(decoded.sub, function(e, u) {
                if (e) {next(e)}
                if (u) {
                    req.user = u;
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

    db.Users.findOne({'local.email': req.body.email})
        .then(function(user) {
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
 * Expects at minimum {data: {userID, name}}
 */
app.post('/api/auth/verify-facebook', function(req, res, next) {
    debugger;
    if (!req.body || !req.body.user || !req.body.user.id) {
        return next("Error completing facebook registration or sign-in");
    }

    db.Users.findOne({'facebook.id': req.body.user.id})
        .then(function(user) {
            if (!user) {
                var u = new db.User({
                    facebook: {
                        id: req.body.user.id,
                        name: req.body.user.name
                    },
                    name: req.body.user.name
                });
                return u.save(function(err, user) {
                    if (err) { console.error (err); }
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

/**
 * Expects at minimum {data: {userID, name}}
 */
app.post('/api/auth/verify-google', function(req, res, next) {
    if (!req.body || !req.body.data || !req.body.data.userID) {
        return next("Error completing google registration or sign-in");
    }

    db.Users.findOne({'google.id': req.body.data.userID})
        .then(function(user) {
            if (!user) {
                var u = new db.User({
                    google: {
                        id: req.body.data.userID,
                        name: req.body.data.name
                    },
                    name: req.body.data.name
                });
                return u.save(function(err, user) {
                    if (err) { console.error (err); }
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