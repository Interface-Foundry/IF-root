// exploring tests using Mocha 
// and the Chai assertions library.
// -DT

var assert = require('assert');
var expect = require('chai').expect;
const snapclient = require('../snapclient')



describe('the sum of', function() {
  describe('2 and 2', function() {
    it('should return 4', function() {
	assert.equal(2+2, 4);
    });
  });
});


// the reference to 'done()' is part of the async capability
// in Mocha, but I'm not actually using it here

describe('when we call the Snap microservice', function(){
    describe('the endpoint /user/<id>', function() {	
	it('should return something', function(done) {
	    var jsondoc = snapclient.talkToSnap();	
	    expect(jsondoc).to.exist;
	    done();
	});
    });
});
