var browser = require('browser');
var UserTools = require('../UserTools');
require('chai').should();

describe('login process', function() {
  it('should log a body in with email/password', function(done) {
    UserTools.login(UserTools.users.peach, function() {
      browser.get('/api/user/loggedin', function(err, res, body) {
        if (err) {done(err)}
        body.name.should.equal('Princess Peach');
        done();
      });
    });
  });
  it('should log a body out', function(done) {
    UserTools.logout(function() {
      browser.get('/api/user/loggedin', function(err, res, body) {
        if (err) {done(err)}
        body.should.equal('Internal Server Error');
        done();
      });
    });
  });
});
