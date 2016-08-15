// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
var queue = require('../chat/components/queue-mongo');

var json = { 
  text: 'hello',
  incoming: true,
  original_text: 'hello',
  origin: 'facebook' };
var key  = 'facebook_unit_test_' + Date.now

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
        queue.publish('incoming', json, key);
	    var returnData;
	    beforeEach(function(callback) {
	    
		queue.topic('incoming').subscribe(incoming => {		    
		    
		    returnData = incoming;
		    callback();
		})
		
	    })
            expect.returnData.to.exist;
	})
    })
})


