// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;



describe('the sum of', function() {
  describe('2 and 2', function() {
    it('should return 4', function() {
	assert.equal(2+2, 4);
    });
  });
});


