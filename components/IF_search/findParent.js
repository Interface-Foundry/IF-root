var db = require('db')
var geolib = require('geolib')
require('colors')

//
// hash of id : landmark pairs
//
var cachedParents = {};

//
// Build parent cache
//
function buildcache() {
  console.log('rebuilding landmark cache'.blue)
  db.Landmarks.find({
    world: true
  })
  .select('name addressString tel loc')
  .exec(function(err, landmarks) {
    if (err) {
      console.error('error rebuild landmark cache'.red)
      console.error(err)
    }
    landmarks.map(function(landmark) {
      cachedParents[landmark._id.toString()] = landmark.toObject();
    })
    console.log('landmark cache rebuilt'.green)
  })
}

buildcache();
setInterval(buildcache, 1000*60*60*12)

/**
 * findParents(item, loc) will return a modified version of item with the
 * closest parent in it.
 */
module.exports = function(item, loc) {
  if (!loc || !loc.lat || !loc.lon) {
    throw new Error('Must supply loc with lat and lon');
  }

  var sortedParents = item.parents.map(function(p) {
    return cachedParents[p.toString()];
  }).map(function(p) {

    // precalculate distance so we only have to do it once for each parent
    p.distance = geolib.getDistance({
        latitude: loc.lat,
        longitude: loc.lon
      }, {
        latitude: p.loc.coordinates[1],
        longitude: p.loc.coordinates[0]
      });
    return p;
  }).sort(function(a, b) {
    return a.distance < b.distance
  });

  // MUTATE OMG IT"S A MUTATION CALL GHOSTBUSTERS
  item.parent = sortedParents[0];
  item.loc = item.parent.loc;
  return item;
}
