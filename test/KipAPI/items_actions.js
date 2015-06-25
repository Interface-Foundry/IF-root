var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();

var mockItem = {
    _id: '1234',
    name: 'Versaci Bag',
    id: 'versacibag1',
    world: false,
    parentID: '1234',
    loc: {
        loc: {
            lat: 40.7352793,
            lon: -73.990638
        }
    },
    itemTags: {
        colors: [],
        categories: [],
        text: []
    },
    ownerUserName: 'Princess Peach',
    ownerUserId: 'peach',
    ownerMongoId: '55799f4a76256a9342b03bad',
    itemImageURL: [String],
    reports: [{
        reporterUserId: String,
        timeReported: Date,
        comment: String,
        reason: String
    }]
};

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

describe('item actions', function() {
  describe('doing anything while logged out', function() {
    UserTools.logoutBefore();
    it('should blow up because you must has login for to make action fun times', function(done) {
      browser.post('/api/items/1234/fave', function(e, r, b) {
        should.exist(b.err);
        done();
      });
    });
  });
  describe('faveing an item', function() {
    var peach;
    before(function(done) {
      UserTools.login(UserTools.users.peach, function(e, user) {
        peach = user;
        browser.post('/api/items/1234/fave', function(e, r, body) {
          done();
        });
      });
    });
    it('should put peach in the faves array', function(done) {
      browser.get('/api/items/1234', function(e, r, body) {
        var peachFavesIt = body.faves.reduce(function(p, o) {
          return p || o.userId === peach._id.toString();
        }, false);
        peachFavesIt.should.equal(true);
      });
    });
  });
  describe('un-faveing an item', function() {
    var peach;
    before(function (done) {
      UserTools.login(UserTools.users.peach, function (e, user) {
        peach = user;
        browser.post('/api/items/1234/unfave', function (e, r, body) {
          done();
        });
      });
    });
    it('should take peach out of the faves array', function (done) {
      browser.get('/api/items/1234', function (e, r, body) {
        var peachFavesIt = body.faves.reduce(function (p, o) {
          return p || o.userId === peach._id.toString();
        }, false);
        peachFavesIt.should.equal(false);
      });
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