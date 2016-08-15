// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
var queue = require('./queue-mongo');



describe('the sum of', function() {
  describe('2 and 2', function() {
    it('should return 4', function() {
	assert.equal(2+2, 4);
    });
  });
});



describe('when we send', function(){
    describe('a hello message to the queue', function(){
	it('should return the standard response', function(){
	    assert(true, false);
	})
    })
})


