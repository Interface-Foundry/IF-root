var _ = require('underscore'),
mongoose = require('mongoose'),
landmarkSchema = require('../IF_schemas/landmark_schema.js');

var route = function(userCoord0, userCoord1, userTime, res){

  landmarkSchema.aggregate(
    [{ "$geoNear": {
      "near": {
        "type": "Point",
        "coordinates": [parseFloat(userCoord0), parseFloat(userCoord1)]
      },
      "distanceField": "distance",
      "minDistance": 150,
      "maxDistance": 2500,
      "spherical": true,
      "query": { "loc.type": "Point" }
    } },
    { "$match" : { "world": true } },
    { "$sort": { "distance": -1 } 
  }],
  function(err,data) {

    var nearby_and_alive = data.filter(function(world){
      return ( (!world.time.end && !world.time.start)  
      || (new Date(world.time.start) + 604800000 > new Date(userTime)) 
      || (new Date(world.time.end) > new Date(userTime)) ) 
    });

    var count = nearby_and_alive.length;
    var random_number = Math.floor(Math.random() * count ); 
    console.log("random item: " + JSON.stringify(nearby_and_alive[random_number]));
    res.send([nearby_and_alive[random_number]]);

  });
};

module.exports = route