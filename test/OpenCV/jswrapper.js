var browser = require('browser');
var opencv = require('../../IF_services/ImageProcessing/JavascriptWrapper');
require('chai').should();

var S3ImageURLs = [
  '',
  '',
  ''
];


describe('opencv item detection', function() {
  it('should return an empty array when no images are detected', function(done) {
    opencv.findItemsInImage(S3ImageURLs[0], function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(0);
      done();
    });
  });

  it('should return a single item for the Domo shirt image', function(done) {
    opencv.findItemsInImage(S3ImageURLs[1], function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(1);
      done();
    });
  });

  it('should return two items for the shirt and pants image', function(done) {
    opencv.findItemsInImage(S3ImageURLs[2], function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(2);
      done();
    });
  });
});
