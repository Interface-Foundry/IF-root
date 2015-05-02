var _ = require('underscore'),
    mongoose = require('mongoose'),
    sanitize = require('mongo-sanitize'),
    landmarkSchema = require('../IF_schemas/landmark_schema.js'),
    async = require('async');

var route = function(textQuery, userCoord0, userCoord1, userTime, res) {

    var sText = sanitize(textQuery);

    if (sText) {
        sText = sText.replace(/[^\w\s]/gi, '');
        console.log('sText is..', sText);
    } else {
        sText = '';
    }

    function searchWorlds(callback, distance) {
        console.log('searchWorlds being called with distance: ', distance)

        var query = {
            $match: {
                $text: {
                    $search: sText
                },
                $or: [{
                    'time.end': {
                        $gt: new Date().setYear(new Date().getFullYear() - 1)
                    }
                }, {
                    'time.end': null
                }, {
                    'time.end': {
                        $exists: true
                    }
                }],
                world: true,
                loc: {
                    $geoWithin: {
                        $centerSphere: [
                            [parseFloat(userCoord1), parseFloat(userCoord0)], distance / 3963.2
                        ]
                    }
                }
            }
        };

        landmarkSchema.aggregate(query, {
                $sort: {
                    score: {
                        $meta: "textScore"
                    }
                }
            }, {
                $limit: 50
            },
            function(err, data) {
                if (err) {
                    console.error('error in text_search');
                    return console.error(err)
                }
                // console.log('Worlds found: ', data.length)

                // Remove entries with end time over one year ago...
                var i = data.length;
                while (i--) {
                    if (data[i].time.end && data[i].time.end < new Date(new Date().setYear(new Date().getFullYear() - 1))) {
                        console.log('Old world found, deleting: ', data[i].name, data[i].time.end)
                        data.splice(i, 1);
                    }
                }

                //If results are less than 20, increase radius of search distance
                if (data.length >= 20) {
                    callback(true, data);
                } else {
                    console.log('Only ', data.length, ' results, increasing distance..')
                    callback(null, data)
                }
            })
    }

    async.series([
            function(callback) {
                searchWorlds(callback, 0.5)
            },
            function(callback) {
                searchWorlds(callback, 2.5)
            },
            function(callback) {
                searchWorlds(callback, 5)
            },
            function(callback) {
                searchWorlds(callback, 50)
            }
        ],
        function(err, results) {
            if (err) {
                console.error('error in text_search async.series');
                console.error(err);
            }

            results = results[results.length - 1]

            console.log('ORIGINL TOP 2 results is: ', results[0], 'YOMAMA', results[1])


            //trying new method
            function compare(a, b) {
            console.log('A: ', a.permissions, 'B: ', b.permissions)
            if (!a.permissions.ownerID && b.permissions.ownerID)
                return 1;
            if (a.permissions.ownerID && !b.permissions.ownerID)
                return -1;
            return 0;
        }

        results.sort(compare);

        

            //trying world query method NOT WORKING CURRENTLY
            // results = _(results).chain().sortBy(function(world) {
            //     return world.permissions.ownerID; // first we sort according to whether the bubble has an ownerID
            // }).sortBy(function(world) {
            //     if (Object.keys(world.time).length == 1) {
            //         return -world.time.created // if the length of the time object is one (just the time created), return -time.created (descending order)
            //     } else if (Object.keys(world.time).length == 3) {
            //         return -world.time.start // if the length of the time object is three (start and end time and created), return -time.start (descending order)
            //     } else { // this is when the time object has two fields (start and created or end and created)
            //         if ((world.time).hasOwnProperty('start')) {
            //             return -world.time.start
            //         } // if it has time.start, return it
            //         else {
            //             return -world.time.created //otherwise, return time.created
            //         }
            //     }
            // }).value();

    console.log('NEW TOP 2 results is: ', results[0], 'YOMAMA', results[1])



            //tempory sorting
            // for (var i = 0; i < results.length; i++) {
            //     results[i] = _(results[i]).chain().sortBy(function(world) {
            //         console.log('WORLD: ', world.permissions.ownerID)
            //         return world.permissions.ownerID; // first we sort according to whether the bubble has an ownerID
            //     }).value();
            // }

            //Retreive parent IDs to query for parent world names for each landmark

            var parentIDs = results.map(function(el) {
                if (!el.parentID) {
                    return undefined
                } else {
                    return el.parentID;
                }
            });
            var parentNames = [];

            async.eachSeries(parentIDs, function(id, callback) {
                if (id) {
                    landmarkSchema.findOne({
                        _id: id
                    }, function(err, parent) {
                        if (err) console.log(err);
                        if (!parent) return console.log('parent not found', parent)
                        parentNames.push(parent.id);
                        callback();
                    })
                } else {
                    parentNames.push(undefined);
                    callback();
                }
            }, function(err) {
                if (err) {
                    console.log('A parent failed to process');
                } else {

                    // console.log('Parent names gathered', parentNames);

                    console.log('Found ', results.length, 'results.');

                    var count = 0;
                    async.eachSeries(results, function(el, callback) {
                        //Set virtual property parentName
                        el.parentName = parentNames[count];
                        count++
                        callback();
                    }, function(err) {
                        // console.log('Virtual property: parentName added to results..',results[results.length - 1])

                        res.send(results);
                    })
                }
            })

        });


    // IF # ADD BEGINNING OF SEARCH, to tag search

    //if BUBBLE WORLD added, search with world:false & search world:true outside of landmark search
    //FOR MATCH GROUP:

    // games.aggregate([
    //     { $match: { 'game_user_id' : '12345789' } },
    //     { $group: {
    //         _id: '$id',
    //         game_total: { $sum: '$game_amount'}, 
    //         game_total_profit: { $sum: '$game_profit'}}
    //     }}
    // ]).exec(function ( e, d ) {
    //     console.log( d )            
    // });




    // landmarkSchema.aggregate({
    //             $match: {
    //                 $text: {
    //                     $search: sText
    //                 },
    //                 loc: {
    //                     $geoWithin: {
    //                         $centerSphere: [
    //                             [parseFloat(userCoord1), parseFloat(userCoord0)], 0.5 / 3963.2
    //                         ]
    //                     }
    //                 }
    //             }
    //         }, {
    //             $sort: {
    //                 score: {
    //                     $meta: "textScore"
    //                 }
    //             }
    //         }, {
    //             $limit: 50
    //         },
    //         function(err, data) {
    //             if (err) {
    //                 return console.log(err)
    //             }

    //             if (data.length < 50) {
    //                 console.log('Not enough results, increasing distance..')
    //                 landmarkSchema.aggregate({
    //                         $match: {
    //                             $text: {
    //                                 $search: sText
    //                             },
    //                             loc: {
    //                                 $geoWithin: {
    //                                     $centerSphere: [
    //                                         [parseFloat(userCoord1), parseFloat(userCoord0)], 2.5 / 3963.2
    //                                     ]
    //                                 }
    //                             }
    //                         }
    //                     }, {
    //                         $sort: {
    //                             score: {
    //                                 $meta: "textScore"
    //                             }
    //                         }
    //                     }, {
    //                         $limit: 50
    //                     },
    //                     function(err, data) {
    //                         if (err) {
    //                             return console.log(err)
    //                         }
    //                         if (data.length < 50) {
    //                             console.log('Not enough results, increasing distance..')
    //                             landmarkSchema.aggregate({
    //                                     $match: {
    //                                         $text: {
    //                                             $search: sText
    //                                         },
    //                                         loc: {
    //                                             $geoWithin: {
    //                                                 $centerSphere: [
    //                                                     [parseFloat(userCoord1), parseFloat(userCoord0)], 5 / 3963.2
    //                                                 ]
    //                                             }
    //                                         }
    //                                     }
    //                                 }, {
    //                                     $sort: {
    //                                         score: {
    //                                             $meta: "textScore"
    //                                         }
    //                                     }
    //                                 }, {
    //                                     $limit: 50
    //                                 },
    //                                 function(err, data) {
    //                                     if (err) {
    //                                         return console.log(err)
    //                                     }
    //                                     if (data.length < 50) {
    //                                         console.log('Not enough results, increasing distance..')
    //                                         landmarkSchema.aggregate({
    //                                                 $match: {
    //                                                     $text: {
    //                                                         $search: sText
    //                                                     },
    //                                                     loc: {
    //                                                         $geoWithin: {
    //                                                             $centerSphere: [
    //                                                                 [parseFloat(userCoord1), parseFloat(userCoord0)], 50 / 3963.2
    //                                                             ]
    //                                                         }
    //                                                     }
    //                                                 }
    //                                             }, {
    //                                                 $sort: {
    //                                                     score: {
    //                                                         $meta: "textScore"
    //                                                     }
    //                                                 }
    //                                             }, {
    //                                                 $limit: 50
    //                                             },
    //                                             function(err, data) {
    //                                                 if (err) {
    //                                                     return console.log(err)
    //                                                 }
    //                                                 console.log('Not enough results, searching worldwide...')
    //                                                 landmarkSchema.aggregate({
    //                                                         $match: {
    //                                                             $text: {
    //                                                                 $search: sText
    //                                                             }
    //                                                         },
    //                                                         {
    //                                                             $sort: {
    //                                                                 score: {
    //                                                                     $meta: "textScore"
    //                                                                 }
    //                                                             }
    //                                                         },
    //                                                         {
    //                                                             $limit: 50
    //                                                         },
    //                                                         function(err, data) {
    //                                                             if (err) {
    //                                                                 return console.log(err)
    //                                                             }
    //                                                             res.send(data);
    //                                                         })


    //                                                 } else {
    //                                                     res.send(data);
    //                                                 }
    //                                             } else {
    //                                                 res.send(data);
    //                                             }
    //                                         });
    //                                 })
    //                         })
    //                 })

    // OLD
    // landmarkSchema.find(
    //     { $text : { $search : sText } },
    //     { score : { $meta: "textScore" } }
    //   ).
    //   sort({ score : { $meta : 'textScore' } }).
    //   limit(50).
    //   exec(function(err, data) {
    //     if (data){
    //         res.send(data);
    //     }
    //     else {
    //         console.log('no results');
    //         res.send({err:'no results'});            
    //     }
    //   });

    // landmarkSchema.aggregate(
    //  [

    //     { $match: { $text: { $search: sText } } },
    //     { $sort: { score: { $meta: "textScore" } } },
    //     { $limit : 50 },
    //     { "$geoNear": {
    //       "near": {
    //         "type": "Point",
    //         "coordinates": [parseFloat(userCoord1), parseFloat(userCoord0)]
    //       },
    //       "distanceField": "distance",
    //       "minDistance": 1,
    //       "maxDistance": 5000,
    //       "spherical": false,
    //       "query": { "loc.type": "Point" }
    //     } }


    //   //{ "$sort": { "distance": -1 } 
    // ],
    // function(err,data) {

    //   if (data){
    //     res.send(data);
    //   }
    //   else {
    //       console.log('no results');
    //       res.send({err:'no results'});            
    //   }

    // //   // var nearby_and_alive = data.filter(function(world){
    // //   //   return ( (!world.time.end && !world.time.start)  
    // //   //   || (new Date(world.time.start) + 604800000 > new Date(userTime)) 
    // //   //   || (new Date(world.time.end) > new Date(userTime)) ) 
    // //   // });

    // //   // var count = nearby_and_alive.length;
    // //   // var random_number = Math.floor(Math.random() * count ); 
    // //   // console.log("random item: " + JSON.stringify(nearby_and_alive[random_number]));
    // //   // res.send([nearby_and_alive[random_number]]);

    // });

};

module.exports = route