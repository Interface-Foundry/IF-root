var db = require('db')
var kip = require('kip')
var _ = require('lodash')

var save = _.throttle(function(item) {
  console.log('saving', item.name)
  console.log(item.loc.coordinates  )
  item.save(function(e) {
    kip.fatal(e);
  })
}, 100)

db.Landmarks.find({
  world: true,
  name: /nordstrom/i,
  addressString: {$exists: true}
}, function(e, stores) {
  kip.fatal(e);
  console.log('found', stores.length, 'nordstrom stores')

  // dictionary of id:store values
  var storeDict = stores.reduce(function(p, s) {
    p[s._id.toString()] = s;
    return p;
  }, {})

  // list of california store object ids
  var CAStores = stores.filter(function(s) {
    return s.addressString.indexOf('CA') > 0;
  }).map(function(s) {
    return s._id;
  })
  console.log('found', CAStores.length, 'stores in CA');

  db.Landmarks.find({
    world: false,
    linkbackname: 'nordstrom.com',
    name: /gown/i
  }).select('loc parents').exec(function(e, r) {
    kip.fatal(e);
    console.log('found', r.length, 'nordstrom items')

    r.map(function(i) {
      // add the CA stores to the parents array
      i.parents = i.parents.concat(CAStores)

      // make sure only unique object ids are in the array (remove dupes)
      var objIds = [];
      i.parents = i.parents.filter(function(p) {
        var strId = p.toString();
        if (objIds.indexOf(strId) >= 0) {
          return false
        } else {
          objIds.push(strId)
          return true;
        }
      })

      // get the geo location for each parent
      i.loc.coordinates = i.parents.map(function(p) {
        return storeDict[p.toString()].loc.coordinates;
      })

      // save (throttled via lodash)
      i.markModified('loc')
      i.markModified('parents')
      i.save(kip.err)
    })
  })
})
