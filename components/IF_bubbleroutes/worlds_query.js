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
    else {
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
        return world.distance;
        }).sortBy(function(world){
            return world.permissions.ownerID;
            //return -(Math.pow( (new Date(world.time.start) - new Date(userTime))/3600000), 2); //time interval is in milliseconds
        }).sortBy(function(world){
            if (Object.keys(world.time).length == 1){
                return -world.time.created
            }
            else if (Object.keys(world.time).length == 3){
                return -world.time.start
            }
            else{
                if ((world.time).hasOwnProperty('start')){
                    return -world.time.start}
                else{
                    return -world.time.created
                }
            }
        }).value();
    for (var i = 0; i < (four_groups[key]).length; i++){
        console.log(four_groups[key][i]['distance'], four_groups[key][i]['name'], four_groups[key][i]['time'])}
    };
//  res.send([four_groups]);

  });
};
console.log('route', route('-73.98952799999999', '40.7392512', '2015-02-05T16:24:26.346Z'))
module.exports = route
