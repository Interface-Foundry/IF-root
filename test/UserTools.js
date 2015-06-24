var browser = require('browser');

var users = {
  kip: {},
  peach: {
    email: 'princesspeach@interfacefoundry.com',
    password: 'princesspeach'
  },
  bowser: {}
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
    browser.post({url: '/api/user/login', json: true, body:  user}, function(e, r, body) {
      done(e, body);
    });
  },
  loginBefore: function(user) {
    before(function(done) {
      module.exports.login(user, done)
    });
  },
  loggedIn: function(user, done) {
    browser.get({url: '/api/user/loggedin'}, , function(e, r, body) {
      done(body);
    });
  },
  users: users
};
