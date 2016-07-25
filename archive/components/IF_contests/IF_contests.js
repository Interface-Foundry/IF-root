var _ = require('lodash'),
    mongoose = require('mongoose'),
    landmarkSchema = require('../IF_schemas/landmark_schema.js'),
    contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
    contestSchema = require('../IF_schemas/contest_schema.js'),
    userSchema = require('../IF_schemas/user_schema.js'),
    mailerTransport = require('../IF_mail/IF_mail.js');

var route = function(imgUpload, uploadContents, userID, cb) {

    contestSchema.findOne({
        live: true
    }, function(err, contest) {
        if (err) console.log(err)

        if (userID) {
            checkEntryValid(userID, uploadContents.userLat, uploadContents.userLon, uploadContents.userTime, uploadContents.world_id, function(valid, distance) {
                if (valid) {
                    var validEntry = true;
                } else {
                    var validEntry = false;
                }
                saveEntry(validEntry, imgUpload, uploadContents, userID, distance);
            });
        }



        function checkEntryValid(userID, userLat, userLon, userTime, worldID, callback) {
            var distanceValid = false;
            var timeValid = false;
            landmarkSchema.findById(worldID, function(err, lm) {
                if (err) {
                    callback(false);
                }
                if (lm.loc) {
                    if (lm.loc.coordinates) {
                        getDistanceFromLatLonInKm(lm.loc.coordinates[1], lm.loc.coordinates[0], userLat, userLon, function(distance) {
                            if (distance <= 15) {
                                distanceValid = true;
                            } else {
                                distanceValid = false;

                            }
                            console.log('userTime is', userTime, 'enddate is', contest.endDate);
                            if (Date.parse(userTime) > Date.parse(contest.endDate)) {
                                timeValid = false;
                                console.log('Contest has already ended!')
                            } else {
                                timeValid = true;
                            }
                            if (timeValid && distanceValid) {
                                callback(true, distance);
                            } else {
                                callback(false, distance);
                            }
                        });
                    }
                }
            });
        }

        function saveEntry(validEntry, imgUpload, uploadContents, userID, distance) {

            var newcontest = new contestEntrySchema({
                userTime: uploadContents.userTime,
                userID: userID,
                worldID: uploadContents.world_id,
                worldName: uploadContents.worldID,
                valid: validEntry,
                userLat: uploadContents.userLat,
                userLng: uploadContents.userLon,
                type: uploadContents.type,
                contestTag: [{
                    tag: uploadContents.hashtag
                }],
                imgURL: imgUpload,
                contestId: contest._id,
                distanceFromWorld: parseFloat(distance)
            });

            newcontest.save(function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    //Send back new contest id to the server via callback
                    cb(data)

                    userSchema.findOneAndUpdate({
                        _id: data.userID
                    }, {
                        $push: {
                            submissions: {
                                worldID: uploadContents.world_id,
                                contestID: contest._id,
                                entryID: data._id,
                                imgURL: imgUpload,
                                timestamp: uploadContents.userTime,
                                hashtag: uploadContents.hashtag
                            }
                        }
                    },function(err, user) {
                        if (err) console.log(err);
                        // console.log('user updated with new submission!',user)

                        //Send contest submission notification email
                        var mailOptions = {
                            to: 'IF <hello@interfacefoundry.com>',
                            from: 'Kip Submissions <contestsubmissions@kipapp.co>',
                            subject: 'New Contest' + data.region + 'Submission!',
                            text: 'Hello,\n\n' +
                                user.profileID + ' (id:' + user._id + ') has entered contest: ' + data.contestId + '. \n \n The AWS image link is: ' + data.imgURL
                        };
                        mailerTransport.sendMail(mailOptions, function(err) {
                            if (err) console.log(err);
                            console.log('Contest entry email sent!');
                        });
                        //end of email

                    })

                    console.log('entry saved');
                }
            });

        }


        //distance between two latlng
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2, callback) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1); // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            callback(d);
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }
    })
};

module.exports = route