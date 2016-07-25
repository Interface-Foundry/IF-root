var db = require('db');
var kip = require('kip')

db.Landmarks.findById(process.argv[2], function(e, r) {
  kip.fatal(e);
  r.loc.coordinates.map(function(p) {
    console.log(p[1] + ', ' + p[0])
  })
  process.exit(0);
})
