var browser = require('browser');
var UserTools = require('../UserTools');
var should = require('chai').should();


describe('user CRUD operations', function(){
  describe('while not logged in', function() {
    UserTools.logoutBefore();
    it('should be able to GET a user', function(done) {
      browser.get('/api/users/' + UserTools.users.peach._id, function(e, r, b) {
        should.equal(e, null);
        b.should.not.have.property('err');
        b.name.should.equal('Princess Peach');
        b._id.toString().should.equal(UserTools.users.peach._id);
        done();
      });
    });
    it('should respond with a nice error, but not die when you cannot find the user', function(done) {
      browser.get('/api/users/1989', function(e, r, b) {
        should.equal(e, null);
        b.should.have.property('err');
        b.err.should.have.property('niceMessage');
        done();
      });
    })
  });
});