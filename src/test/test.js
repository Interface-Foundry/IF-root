// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
var queue = require('../chat/components/queue-mongo');
var db = require('../db');

var msgData = {
    "__v": 0,
    "text": "hello",
    "incoming": true,
    "thread_id": "D21766G8K",
    "original_text": "hello",
    "user_id": "U0337DU9H",
    "origin": "slack",
    "source": {
      "team": "T0337DU9F",
      "ts": "1471372270.000035",
      "text": "hello",
      "user": "U0337DU9H",
      "channel": "D21766G8K",
      "type": "message"
    },
    "_id": "57b35bee6eec20564a33ed84",
    "urlShorten": [],
    "client_res": [],
    "execute": [],
    "tokens": [],
    "resolved": false,
    "ts": "2016-08-16T18:31:10.455Z"
}



var json = { 
    text: 'hello',
    thread_id: 'facebook_1000206960095603',
    incoming: true,
    original_text: 'hello',
    origin: 'facebook',
    ts: Date.now(), 
    
};

var newMessage = new db.Message({
                incoming: true,
                thread_id: msg.thread_id,
                resolved: false,
                user_id: newMsg['source']['user'],
                origin: msg.origin,
                text: text,
                source: newMsg['source']                
            });

/*
var saveNewMessage = function(){

      var new_message = new db.Message({
                incoming: true,
                thread_id: msg.thread_id,
                resolved: false,
                user_id: msg.user_id,
                origin: msg.origin,
                text: text,
                source: msg.source,
                amazon: msg.amazon 
            });
        // queue it up for processing
        return new db.Message(new_message);
}
*/

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
	newMessage.save().then(() => {
            queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'));
         });
        //queue.publish('incoming', json, key);

        beforeEach(function(done) {
            setTimeout(function(){
		
                queue.topic('incoming').subscribe(incoming => {                             
                    returnData = incoming;
                })
		done();
            }, 1000);            
        });

        it('should return the standard response', function(){        
            expect(returnData).to.exist;
        })
    })
})


