var browser = require('browser');
var UserTools = require('../UserTools');
var db = require('../../components/IF_schemas/db');
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

describe('user utility function', function() {
  describe('getMentionedUsers', function() {
    it('should return the correct users', function(done) {
      db.User.getMentionedUsers('hello @peach and @bowser89!')
        .then(function(users) {
          users.length.should.equal(1);
          var profileIDs = users.map(function(u) { return u.profileID});
          profileIDs.should.contain('peach');
          done();
        }, function(e) {
          throw e;
        });
    });
  });
});