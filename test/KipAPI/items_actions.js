var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();
var mockItems = require('./mock_items');

describe('item actions', function() {

  // make a test item
  var item;
  before(function(done) {
    UserTools.login(UserTools.users.peach, function() {
      var i = mockItems.getExample();
      browser.post('/api/items/', {
        body: i
      }, function(e, r, body) {
        item = body;
        done();
      });
    });
  });

  // delete it after everything's done
  after(function(done) {
    browser.post('/api/items/' + item._id + '/delete', done);
  });

  // helper for getting the test item
  var getTestItem = function(callback) {
    browser.get('/api/items/' + item._id, function(e, r, body) {
      callback(body);
    });
  };

  describe('doing actions while logged out', function() {
    UserTools.logoutBefore();
    it('should blow up because you must has login for to make action fun times', function(done) {
      browser.post('/api/items/' + item._id + '/fave', function(e, r, b) {
        should.exist(b.err);
        done();
      });
    });
  });

  describe.only('doing actions while logged in', function() {
    var peach;
    before(function (done) {
      UserTools.login(UserTools.users.peach, function (e, user) {
        peach = user;
        done();
      });
    });

    it('should allow peach to fave an item', function (done) {
      browser.post('/api/items/' + item._id + '/fave', function (e, r, body) {
        getTestItem(function (item) {
          var peachFavesIt = item.faves.reduce(function (p, o) {
            return p || o.userId === peach._id.toString();
          }, false);
          peachFavesIt.should.equal(true);
          UserTools.loggedIn(function (u) {
            u.faves.should.contain(item._id.toString());
            done();
          });
        });
      });
    });

    it('should allow peach to un-fave an item', function (done) {
      browser.post('/api/items/' + item._id + '/unfave', function (e, r, body) {
        getTestItem(function (item) {
          var peachFavesIt = item.faves.reduce(function (p, o) {
            return p || o.userId === peach._id.toString();
          }, false);
          peachFavesIt.should.equal(false);
          UserTools.loggedIn(function (u) {
            u.faves.should.not.contain(item._id.toString());
            done();
          });
        });
      });
    });

    var comment = {
      comment: 'comment' + (Math.random()*100000000|0),
      timeCommented: new Date()
    };

    it('should allow peach to comment on an item', function (done) {
      browser.post('/api/items/' + item._id + '/comment', {
        body: comment
      }, function (e, r, body) {
        getTestItem(function (item) {
          var commentExists = item.comments.reduce(function (p, o) {
            return p || (o.comment === comment.comment);
          }, false);
          commentExists.should.equal(true);
          done();
        })
      });
    });

    it('should allow peach to delete her comment', function (done) {
      browser.post('/api/items/' + item._id + '/deletecomment', {
        body: comment
      }, function (e, r, body) {
        getTestItem(function (item) {
          var commentExists = item.comments.reduce(function (p, o) {
            return p || (o.comment === comment.comment);
          }, false);
          commentExists.should.equal(false);
          done();
        })
      });
    });


    var itemTags = {
      categories: ["category1", "category1000"],
      text: ["superfluous", "melancholy"]
    };

    // from mock_items.js
    var originalTags = {
      colors: ["000000", "FFFFFF"],
      categories: ["category1", "category2"],
      text: ['tag1', 'tag2', 'reallyreallylongtag3']
    };

    var expectedTags = {
      colors: ["000000", "FFFFFF"],
      categories: ["category1", "category2", "category1000"],
      text: ['tag1', 'tag2', 'reallyreallylongtag3', "superfluous", "melancholy"]
    };

    it('should allow peach to add tags to her item', function(done) {
      browser.post('/api/items/' + item._id + '/tag', {
        body: itemTags
      }, function (e, r, body) {
        getTestItem(function (item) {
          item.itemTags.should.eql(expectedTags);
          done();
        });
      });
    });

    it('should allow peach to remove tags from her item', function(done) {
      browser.post('/api/items/' + item._id + '/deletetag', {
        body: itemTags
      }, function (e, r, body) {
        getTestItem(function (item) {
          item.itemTags.should.eql(expectedTags);
          done();
        });
      });
    })
  });
});