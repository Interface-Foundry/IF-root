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
	  if (e) {
		throw new Error(e);
		done(e);
	  } else {
		done();
	  }
	});
  },
  login: function(user, done) {
    browser.post({url: '/api/user/login', json: true, body:  user}, function(e, r, body) {
      done(e, body);
    });
  },
  users: users
};
