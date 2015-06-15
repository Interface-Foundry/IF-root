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
  it('should get world for logged-in user', function(done) {
    UserTools.login(UserTools.users.peach, function() {
      browser.get('/api/worlds/macy_s_at_herald_square', function(e, r, body) {
        body.id.should.equal('macy_s_at_herald_square');
        done();
      });
    });
  });
  it('should get the landmarks for a world', function(done) {
    // landmarks for macy_s_at_herald_square
    browser.get('/api/landmarks?parentID=54f7870c0efc4a3f2b1a9ace', function(e, r, body) {
      body.should.be.instanceof(Object);
      body.landmarks.should.be.instanceof(Array);
    });
  });
});
