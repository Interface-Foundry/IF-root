var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

describe('item action', function() {
  it('should return a body with "err" and "status" properties', function(done) {
    browser.post('/api/items/1234/like', function(e, r, b) {
      should.equal(b.err, null);
      should.exist(b.status);
      done();
    });
  });
});