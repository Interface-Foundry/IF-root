var _ = require('lodash'),
    mongoose = require('mongoose'),
    landmarkSchema = require('../IF_schemas/landmark_schema.js');

var route = function(userCoord0, userCoord1, userTime, res) {
    //console.log(userCoord0, userCoord1, userTime)

    // db.landmarkSchema.aggregate([
    //   {$match: {
    //       $text: {$search: "great test text"} ,
    //       loc: {$geoWithin: {$centerSphere: [[ 14.3, 48.3], 5/6731]}}
    //   }}])

    landmarkSchema.aggregate(
        [{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [parseFloat(userCoord0), parseFloat(userCoord1)]
                },
                distanceField: "distance",
                maxDistance: 2500,
                spherical: true,
                query: {
                    "loc.type": "Point"
                }
            }
        }, {
            $match: {
                world: true
            }
        }, {
            $match: {
                $or: [{
                    'time.end': {
                        $gt: new Date().setYear(new Date().getFullYear() - 1)
                    }
                }, {
                    'time.end': null
                },{
                    'time.end': {
                        $exists: true
                    }
                }]
            }
        }, {
            $sort: {
                distance: -1
            }
        }],
        function(err, data) {
            if (err) return console.log(err);
            // console.log('hitting worlds query, there are ', data.length, ' worlds')
            if (!data) return console.log(data)
                // Remove entries with end time over one year ago...
            var i = data.length;
            while (i--) {
                if (data[i].time.end && data[i].time.end < new Date(new Date().setYear(new Date().getFullYear() - 1))) {
                    console.log('Old world found, deleting: ', data[i].name, data[i].time.end)
                    data.splice(i, 1);
                }
            }
            var four_groups = _.groupBy(data, function(world) {

                if (world.distance <= 150) {
                    if ((!world.time.end && !world.time.start) //If there's no start or end time bubble is always live.
                        || ((new Date(world.time.start) + 604800000) > new Date(userTime)) //If there's a start but no end time, default end is start time plus a week. 604800000 milliseconds is a week
                        || (new Date(world.time.end) > new Date(userTime))) {
                        return '150m';
                    } else {
                        return '150mPast';
                    }
                } else { // world distance is over 150m
                    if ((!world.time.end && !world.time.start) || (new Date(world.time.start) + 604800000 > new Date(userTime)) || (new Date(world.time.end) > new Date(userTime))) {
                        return '2.5km';
                    } else {
                        return '2.5kmPast';
                    }
                }
            });
            for (var key in four_groups) {

                four_groups[key] = _(four_groups[key]).chain().sortBy(function(world) {
                    return world.permissions.ownerID; // first we sort according to whether the bubble has an ownerID
                }).sortBy(function(world) {
                    return world.distance; // next, we sort by distance
                }).sortBy(function(world) {
                    if (Object.keys(world.time).length == 1) {
                        return -world.time.created // if the length of the time object is one (just the time created), return -time.created (descending order)
                    } else if (Object.keys(world.time).length == 3) {
                        return -world.time.start // if the length of the time object is three (start and end time and created), return -time.start (descending order)
                    } else { // this is when the time object has two fields (start and created or end and created)
                        if ((world.time).hasOwnProperty('start')) {
                            return -world.time.start
                        } // if it has time.start, return it
                        else {
                            return -world.time.created //otherwise, return time.created
                        }
                    }
                }).value();

                // for (var i = 0; i < (four_groups[key]).length; i++){
                //     four_groups[key][i]['distance'], four_groups[key][i]['name'], four_groups[key][i]['time'];
                // }
            };

            res.send([four_groups]);

        });
};
//console.log('route', route('-73.98952799999999', '40.7392512', '2015-02-05T16:24:26.346Z'))
module.exports = route