var db = require('db');
var Promise = require('bluebird');
var _ = require('lodash');
var kip = require('kip');
var searchForPlace = require('./searchForPlace');

function findWorldWithoutPlace() {
  db.Landmarks.findOne({
    world: true,
    addressString: {$exists: true},
    'source_google.place_id': {$exists: false},
    'flags.needsGooglePlace': {$ne: false}
  })
    //.limit(10)
    .exec(function(e, world) {
      kip.ohshit(e);
      kip.prettyPrint(world.addressString);
      var loc = {
        lon: world.loc.coordinates[0],
        lat: world.loc.coordinates[1]
      }
      searchForPlace(loc, world.name, world.addressString)
      .then(function(r) {
        r = r.result;
        kip.prettyPrint(r);
        world.source_google = r;
        world.source_google.opening_hours = _.get(r, 'opening_hours.weekday_text')
        world.markModified('source_google');
        world.flags.needsGooglePlace = false;
        world.tel = r.international_phone_number;
        world.save(function(e, w) {
          kip.ohshit(e);
          kip.prettyPrint(w);
        })
      }).catch(function(e) {
        world.flags.needsGooglePlace = false;
        world.save();
      });

    })
}

setInterval(function () {
  findWorldWithoutPlace();
}, 3000)
