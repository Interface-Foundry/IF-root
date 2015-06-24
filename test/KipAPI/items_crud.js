var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var query = {
  loc: TestLocations.SoHoNYC.loc
};

var params = {
  id: '1234'
};

describe('items CRUD operations', function () {
  describe('not logged in', function () {
    before(function (done) {
      UserTools.logout(done);
    });
    it('should be able to get item', function (done) {
      browser.get('/api/items/' + params.id, function (e, r, body) {
        body.should.be.instanceof(Object);
        body.should.have.ownProperty('ownerUserName');
        body.should.have.ownProperty('ownerMongoId');
        body.should.have.ownProperty('itemImageURL');
        done(e);
      });
    });
    it.skip('should NOT be able to post an item', function (done) {
      done();
    });
  });

  describe('logged in as Princess Peach', function () {
    before(function (done) {
      UserTools.login(UserTools.users.peach, done);
    });

    it('should be able to post an item', function (done) {
      browser.post('/api/items/', {
        body: query.loc
      }, function (e, r, body) {
        body.should.be.instanceof(Object);
        body.should.have.ownProperty('itemTags');
        body.itemTags.text.length.should.not.equal(0);
        body.itemTags.colors.length.should.not.equal(0);
        body.itemTags.categories.length.should.not.equal(0);
        body.should.have.ownProperty('ownerUserName');
        body.ownerUserName.should.equal(req.user.name);
        body.should.have.ownProperty('ownerMongoId');
        body.ownerMongoId.should.equal(req.user._id);
        body.should.have.ownProperty('itemImageURL');
        body.itemImageURL.should.be.instanceof(String);
        done(e);
      });
    });

    it('should be able to update item if owner of that item', function (done) {
      browser.put('/api/items/' + params.id, function (e, r, body) {
        body.should.be.instanceof(Object);
        body.should.have.ownProperty('ownerUserName');
        body.ownerUserName.should.equal(req.user.name);
        body.should.have.ownProperty('ownerMongoId');
        body.ownerMongoId.should.equal(req.user._id);
        body.should.have.ownProperty('itemImageURL');
        body.itemImageURL.should.be.instanceof(String);
        done()
      });
    });

    it('should be able to delete item if owner of that item', function (done) {
      browser.delete('/api/items/' + params.id, function (e, r, body) {
        body.ownerUserName.should.equal(req.user.name);
        body.should.not.throw(Error)
        body.should.equal(200)
      });
    })


    //comment emoji test
  });
})
;