var app = require('express').Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var db = require('db');
var secret = 'SlytherinOrGTFO';
var expiresInMinutes = 10*365*24*60; // 10 years


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

                var jwtUser = {
                    sub: user._id.toString(),
                    name: user.name
                };

                var token = jwt.sign(jwtUser, secret, {expiresInMinutes: expiresInMinutes});
                res.json({
                    user: user,
                    token: token
                });
            });
        }, next);
});


module.exports = app;