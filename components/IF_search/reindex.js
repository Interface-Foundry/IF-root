var db = require('db');
var kip = require('kip');
var testLocations = require('../../test/TestLocations');

db.Landmarks
  .update({
    world: false,
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [testLocations.UnionSquareNYC.loc.lon, testLocations.UnionSquareNYC.loc.lat]
        },
        $maxDistance: 20000
      }
    }
  },
  {
    'flags.classifierFirstPassDone': false
  },
  {
    multi: true
  })
  .exec(function(e, r) {
    kip.err(e);
    console.log(r);
    kip.exit();
  })
  //.update({$set: {'flags.classifierFirstPassDone': false}})
