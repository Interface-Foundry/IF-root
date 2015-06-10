var browser = require('browser');
var UserTools = require('../UserTools');
require('chai').should();

describe('world api', function() {
  it('should get world for non-logged-in user', function(done) {
    UserTools.logout(function() {
      browser.get('/api/worlds/macy_s_at_herald_square', function(e, r, body) {
        body.id.should.equal('macy_s_at_herald_square');
        done();
      });
    });
  });
  it('should get world for non-logged-in user', function(done) {
    UserTools.login(UserTools.users.peach, function() {
      browser.get('/api/worlds/macy_s_at_herald_square', function(e, r, body) {
        body.id.should.equal('macy_s_at_herald_square');
        done();
      });
    });
  });
});
