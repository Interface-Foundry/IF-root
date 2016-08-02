var browser = require('browser');
var UserTools = require('../UserTools');
var should = require('chai').should();

var peachId = UserTools.users.peach._id;
var sonicId = UserTools.users.sonic._id;

describe('User actions', function() {
  describe('while not logged in', function() {
    UserTools.logoutBefore();

    it('should not be able to follow', function(done) {
      browser.post('/api/users/' + sonicId + '/follow', function(e, r, b) {
        should.equal(e, null);
        b.should.have.property('err');
        done();
      });
    });

    it('should not be able to get notifications', function(done) {
      browser.get('/api/users/notifications', function(e, r, b) {
        should.equal(e, null);
        b.should.have.property('err');
        done();
      });
    });
  });


  describe('while logged in', function() {
    UserTools.loginBefore(UserTools.users.peach);

    it('should be able to follow', function(done) {
      browser.post('/api/users/' + sonicId + '/follow', function (e, r, b) {
        should.equal(e, null);
        b.should.not.have.property('err');
        UserTools.loggedIn(function (me) {
          me.following.should.contain(sonicId);
        });
        done();
      });
    });

    it('should be able to unfollow', function(done) {
      browser.post('/api/users/' + sonicId + '/unfollow', function (e, r, b) {
        should.equal(e, null);
        b.should.not.have.property('err');
        UserTools.loggedIn(function (me) {
          me.following.should.not.contain(sonicId);
        });
        done();
      });
    });
  });
});
