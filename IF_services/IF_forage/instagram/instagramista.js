var request=require('request');
var https = require('https');
var async = require('async');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose'),
    monguurl = require('monguurl');
var helper = require('./helper');
var RSVP = require('rsvp');

var instagram = require('instagram-node').instagram();
instagram.use({
    access_token: '519da9c304a147ddb12e0b58bf2a0598'
});
instagram.use({
    client_id: '9069a9b469824abea0d0cce7acb51fa8',
    client_secret: 'cb7a9f7cdb67498bbf0641b6d7489604'
});

global.config = require('config');

mongoose.connect(global.config.mongodb.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Landmarks = require('../../../components/IF_schemas/landmark_schema');

var AWS = require('aws-sdk');
var bucketName = 'if.kip.apparel.images';
var bucketUrlPrefex = 'https://s3.amazonaws.com/' + bucketName + '/';
var s3 = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});


var redis = require('redis');
client = redis.createClient();



/**
 * Mapping of instagram users to their world id's
 */
var instagramUsers = [
    { username: "wildstylela", userId: "239779226", worldId: "childrens"}

    //"kklostermanjewelry": "",
    //"raleighvintage": "",
    //"whendecadescollide": ""
];

/**
 * number of days to go back into the past when scraping
 */
var days = 14;
var daysInMilliseconds = 1000 * 60 * 60 * 24 * days;

/**
 * Process each instagram username that we have
 */
instagramUsers.map(function(user) {
    console.log('processing ' + user.username);

    /**
     * get the most recent post id for this user
     */
    var lastPostId;
    var world;
    var getLastPost = Landmarks.findOne({'parentID': user.worldId})
        .sort({created_time: 'desc'})
        .exec();
    var getWorld = Landmarks.findOne({id: user.worldId}).exec();

    /**
     * handles the response from instagram
     */
    var handlePosts = function(err, medias, pagination, remaining, limit) {
        if (err) {
            return console.error(err);
        }

        var doneWithUser = false;
        medias.map(function(post) {
            if (!post.images || doneWithUser) {
                return;
            }

            // if we have it already, then we're done
            if (post.id === lastPostId) {
                console.log('all caught up for user ' + user.username);
                doneWithUser = true;
                return;
            } else if ((+new Date() - post.created_time*1000) > daysInMilliseconds) {
                console.log('hit maximum number of days for user ' + user.username);
                doneWithUser = true;
                return;
            }

            // otherwise save this exciting new instagram post to our database
            var filename = user.username + '/' + helper.getFileNameFromURL(post.images.standard_resolution.url);
            var landmark = new Landmarks({
                id: user.username + post.id,
                source_instagram_post: {
                    id: post.id,
                    created_time: post.created_time,
                    img_url: bucketUrlPrefex + filename,
                    original_url: post.images.standard_resolution.url,
                    text: post.caption.text,
                    tags: post.tags
                },
                parentID: user.worldId,
                loc: {
                    type: 'Point',
                    coordinates: world.loc.coordinates
                }
            });

            landmark.save(function(err) {
                if (err) { 
                    console.error(err);
                }
            });
            
            // also upload the image to S3
            https.get(landmark.source_instagram_post.original_url, function(stream) {
                s3.upload({
                    Bucket: bucketName,
                    Key: filename,
                    Body: stream,
                    ACL: 'public-read'
                }, function(err, data) {
                    if (err) {
                        console.error('Error uploading ' + landmark.source_instagram_post.original_url);
                        console.error(err);
                        return
                    }
                    console.log('Uploaded ' + landmark.source_instagram_post.img_url);

                    // Add it to the queue for image processing wizardry
                    client.rpush('snaps', landmark.toString());

                });
            });
        });

        if (!doneWithUser && pagination && pagination.next) {
            pagination.next(handlePosts)
        }
    }

    RSVP.hash({landmark: getLastPost, world: getWorld}).then(function(results) {
        if (results.world !== null) {
            world = results.world;
        } else {
            console.log('could not get world for instagram user')
            console.log(user);
            return
        }
        if (results.landmark !== null) {
            console.log('got last post');
            lastPostId = results.landmark.source_instagram_post.id;
        } else {
            console.log('no posts yet for user ' + user.username);
        }

        instagram.user_media_recent(user.userId, handlePosts);
    }).catch(function(err) {
        console.error(err);
    });
});
