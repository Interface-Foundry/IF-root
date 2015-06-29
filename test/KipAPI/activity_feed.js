var browser = require('browser');
var UserTools = require('../UserTools');
var TestLocations = require('../TestLocations');
var should = require('chai').should();
var mockItems = require('./mock_items');

var peachId = UserTools.users.peach._id.toString();
var peach = UserTools.users.peach;
var defaultResponse = {
    status: '(⌒‿⌒)'
};


// helpers to get latest activity
var getMyLatestActivity = function(callback) {
    browser.get('/api/users/' + peachId + '/activity/me', function(e, r, b) {
        should.equal(e, null);
        should.not.exist(b.err);
        console.log(b.results);
        callback(b.results[0]);
    });
};

var getFollowersLatestActivity = function(callback) {
    browser.get('/api/users/' + peachId + '/activity/followers', function(e, r, b) {
        should.equal(e, null);
        should.not.exist(b.err);
        callback(b.results.sort(function(a, b) {
            return a.activityTime > b.activityTime;
        })[0]);
    });
};

describe.only('activity feed', function() {

    //test item
    var item;
    // helper for getting the test item
    var getTestItem = function(callback) {
        browser.get('/api/items/' + item._id, function(e, r, body) {
            callback(body);
        });
    };

    describe('doing actions while logged in', function() {
        var peach;
        before(function(done) {
            UserTools.login(UserTools.users.peach, function(e, user) {
                peach = user;
                done();
            });
        });

        it('should post an activity to my feed when I post a snap', function(done) {
            var i = mockItems.getExample();
            browser.post('/api/items/', {
                body: i
            }, function(e, r, body) {
                item = body;
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(true);
                    activity.publicVisible.should.equal(true);
                    activity.userIds.should.contain(peachId);
                    activity.landmarkIds.should.contain(item._id.toString());
                    activity.activityAction.should.equal('item.post')
                    activity.data.owner.mongoId.should.equal(item.owner.mongoId.toString());
                    activity.data.owner.profileID.should.equal(item.owner.profileID);
                    activity.data.owner.name.should.equal(item.owner.name);
                    activity.data.item.mongoId.should.equal(item._id.toString())
                    activity.data.item.id.should.equal(item.id)
                    activity.data.item.name.should.equal(item.name)
                    activity.data.item.itemImageURL.should.equal(item.ImageURL)
                    done();
                });
            });
        });


        it('should post an activity to my feed when I follow someone', function(done) {
            var sonic = UserTools.users.sonic;
            browser.post('/api/users/' + peachId + '/follow', {
                body: sonic
            }, function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(true);
                    activity.publicVisible.should.equal(true);
                    activity.userIds.should.contain(peachId.toString());
                    activity.userIds.should.contain(sonic._id.toString());
                    activity.activityAction.should.equal('user.follow')
                    activity.data.follower.mongoId.should.equal(peach._id.toString());
                    activity.data.follower.profileID.should.equal(peach.profileID);
                    activity.data.follower.name.should.equal(peach.name);
                    activity.data.followed.mongoId.should.equal(sonic._id.toString());
                    activity.data.follower.profileID.should.equal(sonic.profileID);
                    activity.data.follower.name.should.equal(sonic.name);
                    done();
                });
            });
        });

        it('should post a private activity to my feed when I unfollow someone', function(done) {
            var sonic = UserTools.users.sonic;
            browser.post('/api/users/' + peachId + '/unfollow', {
                body: sonic
            }, function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(true);
                    activity.publicVisible.should.equal(false);
                    activity.userIds.should.contain(peachId.toString());
                    activity.userIds.should.contain(sonic._id.toString());
                    activity.activityAction.should.equal('user.unfollow')
                    activity.data.follower.mongoId.should.equal(peach._id.toString());
                    activity.data.follower.profileID.should.equal(peach.profileID);
                    activity.data.follower.name.should.equal(peach.name);
                    activity.data.follower.avatar.should.equal(peach.avatar)
                    activity.data.followed.mongoId.should.equal(sonic._id.toString());
                    activity.data.followed.profileID.should.equal(sonic.profileID);
                    activity.data.followed.name.should.equal(sonic.name);
                    activity.data.followed.avatar.should.equal(sonic.avatar);
                    done();
                });
            });
        });

        it('should show a private activity when peach faves an item', function(done) {
            var i = mockItems.getExample();
            browser.post('/api/items/' + i._id + '/fave', function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(true);
                    activity.publicVisible.should.equal(false);
                    activity.userIds.should.contain(peachId.toString());
                    activity.userIds.should.contain(i.owner.mongoId.toString());
                    activity.landmarkIds.should.contain(i._id.toString())
                    activity.activityAction.should.equal('item.fave')
                    activity.data.faver.mongoId.should.equal(peach._id.toString());
                    activity.data.faver.profileID.should.equal(peach.profileID);
                    activity.data.faver.name.should.equal(peach.name);
                    activity.data.faver.avatar.should.equal(peach.avatar)
                    activity.data.owner.mongoId.should.equal(i.owner.mongoId.toString());
                    activity.data.owner.profileID.should.equal(i.owner.profileID);
                    activity.data.owner.name.should.equal(i.owner.name);
                    activity.data.item.mongoId.should.equal(i._id.toString())
                    activity.data.item.id.should.equal(i.id)
                    activity.data.item.name.should.equal(i.name)
                    activity.data.item.itemImageURL.should.equal(i.ImageURL)
                    done();
                });
            });
        });

        it('should show a private activity when peach unfaves an item', function(done) {
            var i = mockItems.getExample();
            browser.post('/api/items/' + i._id + '/unfave', function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(false);
                    activity.publicVisible.should.equal(false);
                    activity.userIds.should.contain(peachId.toString());
                    activity.userIds.should.contain(i.owner.mongoId.toString());
                    activity.landmarkIds.should.contain(i._id.toString())
                    activity.activityAction.should.equal('item.unfave')
                    activity.data.faver.mongoId.should.equal(peach._id.toString());
                    activity.data.faver.profileID.should.equal(peach.profileID);
                    activity.data.faver.name.should.equal(peach.name);
                    activity.data.faver.avatar.should.equal(peach.avatar)
                    activity.data.owner.mongoId.should.equal(i.owner.mongoId.toString());
                    activity.data.owner.profileID.should.equal(i.owner.profileID);
                    activity.data.owner.name.should.equal(i.owner.name);
                    activity.data.item.mongoId.should.equal(i._id.toString())
                    activity.data.item.id.should.equal(i.id)
                    activity.data.item.name.should.equal(i.name)
                    activity.data.item.itemImageURL.should.equal(i.ImageURL)
                    done();
                });
            });
        });

        var comment = {
            comment: 'comment' + (Math.random() * 100000000 | 0),
            timeCommented: new Date()
        };

        it('should show an activity when peach comments on an item', function(done) {
            var i = mockItems.getExample();
            browser.post('/api/items/' + i._id + '/comment', {
                body: comment
            }, function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(true);
                    activity.publicVisible.should.equal(true);
                    activity.userIds.should.contain(peachId);
                    activity.userIds.should.contain(i.owner.mongoId.toString());
                    activity.landmarkIds.should.contain(i._id.toString())
                    activity.data.commenter.mongoId.should.equal(peach._id.toString());
                    activity.data.commenter.profileID.should.equal(peach.profileID);
                    activity.data.commenter.name.should.equal(peach.name);
                    activity.data.commenter.avatar.should.equal(peach.avatar)
                    activity.data.owner.mongoId.should.equal(i.owner.mongoId.toString());
                    activity.data.owner.profileID.should.equal(i.owner.profileID);
                    activity.data.owner.name.should.equal(i.owner.name);
                    activity.data.item.mongoId.should.equal(i._id.toString())
                    activity.data.item.id.should.equal(i.id)
                    activity.data.item.name.should.equal(i.name)
                    activity.data.item.itemImageURL.should.equal(i.ImageURL)
                    activity.activityAction.should.equal('item.comment')
                    done();
                });
            });
        });

        it('should show a private activity when peach deletes her comment on an item', function(done) {
            var i = mockItems.getExample();
            browser.post('/api/items/' + i._id + '/deletecomment', {
                body: comment
            }, function(e, r, body) {
                body.should.equal(defaultResponse)
                getMyLatestActivity(function(activity) {
                    activity.privateVisible.should.equal(false);
                    activity.publicVisible.should.equal(false);
                    activity.userIds.should.contain(peachId);
                    activity.userIds.should.contain(i.owner.mongoId.toString());
                    activity.landmarkIds.should.contain(i._id.toString())
                    activity.data.commenter.mongoId.should.equal(peach._id.toString());
                    activity.data.commenter.profileID.should.equal(peach.profileID);
                    activity.data.commenter.name.should.equal(peach.name);
                    activity.data.commenter.avatar.should.equal(peach.avatar)
                    activity.data.owner.mongoId.should.equal(i.owner.mongoId.toString());
                    activity.data.owner.profileID.should.equal(i.owner.profileID);
                    activity.data.owner.name.should.equal(i.owner.name);
                    activity.data.item.mongoId.should.equal(i._id.toString())
                    activity.data.item.id.should.equal(i.id)
                    activity.data.item.name.should.equal(i.name)
                    activity.data.item.itemImageURL.should.equal(i.ImageURL)
                    activity.activityAction.should.equal('item.deletecomment')
                    done();
                });
            });
        });

        // it('should show an activity when peach faves a look', function(done) {
        // });
        // it('should show an activity when peach unfaves a look', function(done) {
        // });

    });
});