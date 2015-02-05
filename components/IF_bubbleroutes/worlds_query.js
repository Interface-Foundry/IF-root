var _ = require('underscore'),
mongoose = require('mongoose'),
landmarkSchema = require('../IF_schemas/landmark_schema.js');

var route = function(userCoord0, userCoord1, userTime, res){
console.log(userCoord0, userCoord1, userTime)
  landmarkSchema.aggregate(
    [{ "$geoNear": {
      "near": {
        "type": "Point",
        "coordinates": [parseFloat(userCoord0), parseFloat(userCoord1)]
      },
      "distanceField": "distance",
      "maxDistance": 2500,
      "spherical": true,
      "query": { "loc.type": "Point" }
    } },
    { "$match" : { "world": true } },
    { "$sort": { "distance": -1 } 
  }],
  function(err,data) {
    var four_groups = _.groupBy(data, function(world){

    if (world.distance <= 150) {
        if ( (!world.time.end && !world.time.start)  //If there's no start or end time bubble is always live.
          || ( (new Date(world.time.start) + 604800000) > new Date(userTime)) //If there's a start but no end time, default end is start time plus a week. 604800000 milliseconds is a week
          || (new Date(world.time.end) > new Date(userTime)) ) {
          return '150m';
        }
        else { 
            return '150mPast'; 
        }
    }
    else { // world distance is over 150m
        if ( (!world.time.end && !world.time.start)  
      || (new Date(world.time.start) + 604800000 > new Date(userTime)) 
      || (new Date(world.time.end) > new Date(userTime)) ) {
      return '2.5km';
  }
    else { 
        return '2.5kmPast';
  }}
});
    for(var key in four_groups) {
        four_groups[key] = _(four_groups[key]).chain().sortBy(function(world) {
        return world.permissions.ownerID; // first we sort according to whether the bubble has an ownerID
        }).sortBy(function(world){
            return world.distance; // next, we sort by distance
        }).sortBy(function(world){
            if (Object.keys(world.time).length == 1){
                return -world.time.created // if the length of the time object is one, return -time.created (descending order)
            }
            else if (Object.keys(world.time).length == 3){
                return -world.time.start // if the length of the time object is three, return -time.start (descending order)
            }
            else{ // this is when the time object has two fields
                if ((world.time).hasOwnProperty('start')){
                    return -world.time.start}  // if it has time.start, return it
                else{
                    return -world.time.created //otherwise, return time.created
                }
            }
        }).value();
    for (var i = 0; i < (four_groups[key]).length; i++){
        console.log(four_groups[key][i]['distance'], four_groups[key][i]['name'], four_groups[key][i]['time'])}
    };
  res.send([four_groups]);

  });
};
console.log('route', route('-73.98952799999999', '40.7392512', '2015-02-05T16:24:26.346Z'))
module.exports = route
