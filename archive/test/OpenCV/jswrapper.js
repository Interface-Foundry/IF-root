var browser = require('browser');
var opencv = require('../../IF_services/ImageProcessing/OpenCVJavascriptWrapper');
require('chai').should();

var S3ImageURLs = {
  blank: 'https://s3.amazonaws.com/if-server-general-images/2015/5/Untitled.png',
  domoShirt: 'https://s3.amazonaws.com/if-server-general-images/2015/5/IMG_20150611_181649-4.jpg',
  shirtAndPants: 'https://s3.amazonaws.com/if-server-general-images/2015/5/IMG_20150611_181649-2.jpg'
};


describe.skip('opencv item detection', function() {
  it('should return an empty array when no images are detected', function(done) {
    opencv.findItemsInImage(S3ImageURLs.blank, function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(0);
      done();
    });
  });

  it('should return a single item for the Domo shirt image', function(done) {
    opencv.findItemsInImage(S3ImageURLs.domoShirt, function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(1);
      done();
    });
  });

  it('should return two items for the shirt and pants image', function(done) {
    opencv.findItemsInImage(S3ImageURLs.shirtAndPants, function(err, data) {
      if (err) { done(err) }
      data.should.have.property('items');
      data.items.should.be.instanceOf(Array);
      data.items.length.should.equal(2);
      done();
    });
  });
});
