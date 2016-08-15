// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
var queue = require('../chat/components/queue-mongo');
var db = require('../components/db');

var json = { 
    text: 'hello',
    thread_id: 'facebook_1000206960095603',
    incoming: true,
    original_text: 'hello',
    origin: 'facebook',
    ts: Date.now(), 
    
};

var key  = 'facebook_unit_test_' + Date.now();

describe('the sum of', function() {
  describe('2 and 2', function() {
    it('should return 4', function() {
        assert.equal(2+2, 4);
    });
  });
});



describe('when we send', function(){
    describe('a hello message to the queue', function(){
        var returnData = null;
        queue.publish('incoming', json, key);

        beforeEach(function(done) {
            setTimeout(function(){
                queue.topic('incoming').subscribe(incoming => {                             
                    returnData = incoming;
                })
                done();
            }, 2000);
            returnData = 'foobar';
        });

        it('should return the standard response', function(){        
            expect(returnData).to.exist;
        })
    })
})


