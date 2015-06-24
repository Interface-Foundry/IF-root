var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var mockItem = {
    _id: '1234',
    name: 'Veraci Bag',
    id: 'versacibag1',
    world: false,
    parentID: '1234',
    loc: {
        loc: {
            lat: 40.7352793,
            lon: -73.990638
        }
    },
    {
        colors: [],
        categories: [],
        text: []
    },
    ownerUserName: '',
    ownerUserId: String,
    ownerMongoId: String,
    itemImageURL: [String],
    reports: [{
        reporterUserId: String,
        timeReported: Date,
        comment: String,
        reason: String
    }],
}

var mockComment1 = {
    _id:'4321',
    roomID: mockItem._id,
    userID: 'notpeachesid',
    msg: 'i am bowser',
    time: {
        type: Date,
        default: Date.now
    },
    avatar: 'url'
}

var mockComment2 = {
    _id: '1234',
    roomID: mockItem._id,
    userID: 'peachesid',
    msg: 'save me mario',
    time: {
        type: Date,
        default: Date.now
    },
    avatar: 'url'
}


var params = {
    itemId: '1234',
    commentId: '1234',
}

var query = {
    obj: {
        categories: ['shoes'],
        text: ['striped', 'versaci', 'formal']
    },
    msg: 'hello world!'
}

describe('item action', function() {
    it('should return a body with "err" and "status" properties', function(done) {
        browser.post('/api/items/1234/like', function(e, r, b) {
            should.not.exist(b.err);
            should.exist(b.status);
            done();
        });
    });

    describe('not logged in', function() {
        before(function(done) {
            UserTools.logout(done);
        });
    });

    describe('logged in as Princess Peach', function() {
        before(function(done) {
            UserTools.login(UserTools.users.peach, function(err, user) {
                var user = user;
            });
        });

        describe('commenting on an item', function() {
            it('should return a worldchat object', function(done) {
                browser.post('/api/items/' + params.itemId, {
                    body: query.obj
                }, function(e, r, body) {
                    body.should.be.instanceof(Object);
                    body.should.have.ownProperty('roomID');
                    body.should.have.ownProperty('userID');
                    body.should.have.ownProperty('msg');
                    body.should.have.ownProperty('time');
                    body.should.have.ownProperty('avatar');
                });
            });
        })

        describe('deleting a comment', function() {
            it('should respond with 200 if user is the one who made the comment', function(done) {
                browser.post('/api/items/' + params.itemId + '/deletecomment', function(e, r, body) {
                  body.should.equal(200)
                });
            });
        })




    })

});