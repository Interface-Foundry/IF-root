var browser = require('browser');

var users = {
    kip: {},
    peach: {
        creds: {
            email: 'princesspeach@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '55799f4a76256a9342b03bad',
        profileID: 'peach',
        name: 'Princess Peach',
        avatar: 'https://s3.amazonaws.com/if-server-avatars/2'
    },
    sonic: {
        creds: {
            email: 'sonic@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '558d819ca0d6b1f2c5421080',
        profileID: 'sonic',
        name: 'Sonic the Hedgehog',
        avatar: 'https://s3.amazonaws.com/if-server-avatars/2'
    },
    bowser: {
        creds: {
            email: 'bowser@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '559183ffa0d6b1f2c5421082',
        profileID: 'bowser89',
        name: 'Bowser',
        avatar: 'https://s3.amazonaws.com/if-server-avatars/2'
    }
};

module.exports = {
    logout: function(done) {
        browser.get('/api/user/logout', function(e, r, body) {
            done();
        })
    },
    logoutBefore: function() {
        before(function(done) {
            module.exports.logout(done);
        });
    },
    login: function(user, done) {
        browser.post({
            url: '/api/user/login',
            json: true,
            body: user.creds
        }, function(e, r, body) {
            done(e, body);
        });
    },
    loginBefore: function(user, cb) {
        before(function(done) {
            module.exports.login(user, function(e, u) {
                if (typeof cb === 'function') {
                    cb(e, u);
                }
                done();
            })
        });
    },
    loggedIn: function(done) {
        browser.get({
            url: '/api/user/loggedin'
        }, function(e, r, body) {
            done(body);
        });
    },
    users: users
};