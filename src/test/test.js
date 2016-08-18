// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
var queue = require('../chat/components/queue-mongo');
var co = require('co');
var message = new db.Message({ 
	thread_id: 'facebook_1000206960095603',
  text: 'hello',
  incoming: true,
  original_text: 'hello',
  origin: 'facebook',
  ts: Date.now() });
var key  = 'facebook_unit_test'

describe('the sum of', function() {
  describe('2 and 2', function() {
    it('should return 4', function() {
	assert.equal(2+2, 4);
    });
  });
});



describe('when we send', function(){
    describe('a hello message to the queue', function(){
	it('should return the standard response', function*( done){
        yield queue.publish('incoming', message, key);
	    var returnData;
	    // beforeEach(function(callback) {
	    
			yield queue.topic('incoming').subscribe(incoming => {		    
			    
			    returnData = incoming;
			})

			yield done()

	    // })
            expect(returnData).text.equals('hello');
	})
    })
})


