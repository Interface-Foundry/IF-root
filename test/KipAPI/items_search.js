var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var searchQuery = {
  text: 'dress',
  colors: [],
  categories: [],
  price: 2,
  radius:.5,
  loc: TestLocations.SoHoNYC.loc
};

describe('items search', function() {
  describe('not logged in', function() {

    var body;
    before(function(done) {
      UserTools.logout(function() {
        browser.post('/api/items/search', {body: searchQuery}, function(e, r, b) {
          body = b;
          done(e);
        });
      });
    });

    it('should contain a results section', function() {
      body.should.have.property('results');
      body.results.should.be.instanceof(Array);
      body.results.length.should.not.equal(0);
    });

    it('should contain links for search pages', function() {
      body.should.have.property('links');
      body.links.should.be.instanceof(Object);
      body.links.self.should.equal('/api/items/search');
      body.links.next.should.equal('/api/items/search?page=1');
      should.not.exist(body.links.prev);
      body.links.first.should.equal('/api/items/search');
      should.not.exist(body.links.last);
    });

    it('should contain the original search body', function() {
      body.query.should.eql(searchQuery);
    });
  });

  describe('logged in as Princess Peach', function() {

    var body;
    before(function(done) {
      UserTools.login(UserTools.users.peach, function() {
        browser.post('/api/items/search', {body: searchQuery}, function(e, r, b) {
          body = b;
          done(e);
        });
      });
    });

    it('should contain a results section', function() {
      body.should.have.property('results');
      body.results.should.be.instanceof(Array);
      body.results.length.should.not.equal(0);
    });

    it('should contain links for search pages', function() {
      body.should.have.property('links');
      body.links.should.be.instanceof(Object);
      body.links.self.should.equal('/api/items/search');
      body.links.next.should.equal('/api/items/search?page=1');
      should.not.exist(body.links.prev);
      body.links.first.should.equal('/api/items/search');
      should.not.exist(body.links.last);
    });

    it('should contain the original search body', function() {
      body.query.should.eql(searchQuery);
    });
  });

  describe('search link traversal', function() {
    UserTools.logoutBefore();
    it('should be able to go to the next link using the "next" link and the "query" object', function(done) {
      browser.post('/api/items/search', {body: searchQuery}, function(e, r, b) {
        if (e) { done(e); }
        b.links.next.should.equal('/api/items/search?page=1');
        browser.post(b.links.next, {body: b.query}, function(e, r, b) {
          if (e) { done(e); }
          b.links.self.should.equal('/api/items/search?page=1');
          b.links.next.should.equal('/api/items/search?page=2');
          b.links.prev.should.equal('/api/items/search?page=0');
          b.links.first.should.equal('/api/items/search');
          should.not.exist(b.links.last);
          b.results.should.be.instanceof(Array);
          done();
        });
      });
    })
  });
});
