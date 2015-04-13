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
        landmarkSchema.aggregate({
                $match: {
                    $text: {
                        $search: sText
                    },
                    world: true,
                    loc: {
                        $geoWithin: {
                            $centerSphere: [
                                [parseFloat(userCoord1), parseFloat(userCoord0)], distance / 3963.2
                            ]
                        }
                    }
                }
            }, {
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
                    return console.log(err)
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
            if (err) console.log(err);
            //Retreive parent IDs to query for parent world names for each landmark

            var parentIDs = results[results.length - 1].map(function(el) {
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

                    console.log('Found ', results[results.length - 1].length, 'results.');

                    var count = 0;
                    async.eachSeries(results[results.length - 1], function(el, callback) {
                        //Set virtual property parentName
                        el.parentName = parentNames[count];
                        count++
                        callback();
                    }, function(err) {
                        // console.log('Virtual property: parentName added to results..',results[results.length - 1])

                        res.send(results[results.length - 1]);
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