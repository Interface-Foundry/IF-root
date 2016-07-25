var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var params = {
  id: '558b2ad7a0d6b1f2c542107f'
};

var mockItems = require('./mock_items');

describe('looks CRUD operations', function () {
  describe('not logged in', function () {
    before(function (done) {
      UserTools.logout(done);
    });
    
    it('should be able to get item', function (done) {
      browser.get('/api/items/' + params.id, function (e, r, body) {
        should.equal(e, null);
        body.should.be.instanceof(Object);
        body._id.toString().should.equal(params.id);
        body.should.have.ownProperty('owner');
        body.owner.should.have.ownProperty('name');
        body.owner.should.have.ownProperty('mongoId');
        body.owner.should.have.ownProperty('profileID');
        body.should.have.ownProperty('itemImageURL');
        done(e);
      });
    });
    it('should NOT be able to post an item', function (done) {
      var item = mockItems.getExample();
      browser.post('/api/items', {body: item}, function(e, r, body) {
        should.equal(e, null); // remember we don't break the server for permission issues
        should.exist(body.err);
        should.exist(body.err.niceMessage);
        done();
      });
    });
  });
  describe('logged in as Princess Peach', function () {
    var peach;
    var postedItem;
    before(function (done) {
      UserTools.login(UserTools.users.peach, function(e, u) {
        peach = u;
        done();
      });
    });

    it('should be able to post an item', function (done) {
      var item = mockItems.getExample();
      browser.post('/api/items/', {
        body: item
      }, function (e, r, body) {
        postedItem = body;
        body.should.be.instanceof(Object);
        body.should.have.ownProperty('itemTags');
        body.itemTags.text.length.should.not.equal(0);
        body.itemTags.colors.length.should.not.equal(0);
        body.itemTags.categories.length.should.not.equal(0);
        body.should.have.ownProperty('owner');
        body.owner.name.should.equal(peach.name);
        body.owner.mongoId.should.equal(peach._id.toString());
        body.should.have.ownProperty('itemImageURL');
        body.itemImageURL.should.be.instanceof(Array);
        body.itemImageURL.length.should.equal(2);
        body.price.should.equal(2);
        done(e);
      });
    });

    it('should be able to update item if owner of that item', function (done) {
      postedItem.price = 3;
      browser.put('/api/items/' + postedItem._id, {
        body: {price: 3}
      }, function (e, r, body) {
        body.should.be.instanceof(Object);
        body.should.have.ownProperty('itemTags');
        body.itemTags.text.length.should.not.equal(0);
        body.itemTags.colors.length.should.not.equal(0);
        body.itemTags.categories.length.should.not.equal(0);
        body.should.have.ownProperty('owner');
        body.owner.name.should.equal(peach.name);
        body.owner.mongoId.should.equal(peach._id.toString());
        body.should.have.ownProperty('itemImageURL');
        body.itemImageURL.should.be.instanceof(Array);
        body.itemImageURL.length.should.equal(2);
        body.price.should.equal(3);
        done(e)
      });
    });

    it('should be able to delete item if owner of that item', function (done) {
      browser.post('/api/items/' + postedItem._id.toString() + '/delete', function (e, r, body) {
        // then trying to get it should fail hard
        browser.get('/api/items/' + postedItem._id.toString(), function (e, r, body) {
          should.exist(body.err);
          should.exist(body.err.niceMessage);
          done();
        });
      });
    });


    //comment emoji test
  });
})
;