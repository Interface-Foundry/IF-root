var browser = require('browser');

var users = {
    kip: {},
    peach: {
        creds: {
            email: 'princesspeach@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '55799f4a76256a9342b03bad',
        profileID: 'peach101',
        name: 'Princess Peach',
        avatar: 'avatarlink'
    },
    sonic: {
        creds: {
            email: 'sonic@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '558d819ca0d6b1f2c5421080',
        profileID: 'sonic101',
        name: 'Sonic',
        avatar: 'avatarlink'
    },
    bowser: {
        creds: {
            email: 'bowser@interfacefoundry.com',
            password: 'princesspeach'
        },
        _id: '558d819ca0d6b1f2c5421080',
        profileID: 'bowser101',
        name: 'Bowser',
        avatar: 'avatarlink'
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
    loginBefore: function(user) {
        before(function(done) {
            module.exports.login(user, done)
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