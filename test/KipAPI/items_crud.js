var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var query = {
    loc: TestLocations.SoHoNYC.loc
};

var params = {
    id: '1234'
}

describe.only('items CRUD operations', function() {
    describe('not logged in', function() {
        var body;
        before(function(done) {
            UserTools.logout(function() {
                describe('should be able to get item', function() {
                    var body;
                    before(function(done) {
                        browser.get('/api/items/' + params.id, {
                            body: searchQuery
                        }, function(e, r, b) {
                            body = b;
                            done(e);
                        });
                    });
                    it('should return an item with required item properties', function() {
                        body.should.be.instanceof(Object);
                        body.should.have.ownProperty('ownerUserName');
                        body.should.have.ownProperty('ownerMongoId');
                        body.should.have.ownProperty('itemImageURL');
                    });
                })
            });
        });
    });

    describe('logged in as Princess Peach', function() {
        var body;
        before(function(done) {
            UserTools.login(UserTools.users.peach, function() {});
        });
        describe('should be able to post an item', function() {
            var body;
            before(function(done) {
                browser.post('/api/items/', {
                    body: query.loc
                }, function(e, r, b) {
                    body = b;
                    done(e);
                });
            });
            it('should be an object', function() {
                body.should.be.instanceof(Object);
            });
            it('should have required properties of an item', function() {
                body.should.have.ownProperty('itemTags');
                body.itemTags.text.length.should.not.equal(0);
                body.itemTags.colors.length.should.not.equal(0);
                body.itemTags.categories.length.should.not.equal(0);
                body.should.have.ownProperty('ownerUserName');
                body.ownerUserName.should.equal(req.user.name);
                body.should.have.ownProperty('ownerMongoId');
                body.ownerMongoId.should.equal(req.user._id);
                body.should.have.ownProperty('itemImageURL');
                body.itemImageURL.should.be.instanceof(String)
            });
        })

        describe('should be able to update item if owner of that item', function() {
            var body;
            before(function(done) {
                browser.put('/api/items/' + params.id, function(e, r, b) {
                    body = b;
                    done(e);
                });
            });
            it('should be an object', function() {
                body.should.be.instanceof(Object);
            });
            it('should have required properties of an item', function() {
                body.should.have.ownProperty('ownerUserName');
                body.ownerUserName.should.equal(req.user.name);
                body.should.have.ownProperty('ownerMongoId');
                body.ownerMongoId.should.equal(req.user._id);
                body.should.have.ownProperty('itemImageURL');
                body.itemImageURL.should.be.instanceof(String)
            });
            it('should not return 401 unauthorized', function() {
                body.should.not.throw(Error)
            });
        })

        describe('should be able to delete item if owner of that item', function() {
            before(function(done) {
                browser.delete('/api/items/' + params.id, function(e, r, b) {
                    body = b;
                    done(e);
                });
            });
            it('should not return 401 unauthorized', function() {
                body.should.not.throw(Error)
            });
            it('should return 200 success', function() {
                body.should.equal(200)
            });
        })
    });
});