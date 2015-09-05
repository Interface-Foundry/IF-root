
// ROBOT FRIEND!!!!
var db = require('db');
var kip = require('kip');
var _ = require('lodash');

var ruffleconUser;

function getUser() {
  console.log('getting user');
  ruffleconUser = {
    profileID: 'rufflecon',
    name: 'Rufflecon',
    location: 'Stamford, CT',
    avatar: 'https://s3.amazonaws.com/if.kip.apparel.images/rufflecon/rufflecon_avatar.png',
    admin: false,
    description: 'A Northeast USA Alternative Fashion Conference held in Stamford, CT devoted to followers of cute, elegant alternative fashion. https://twitter.com/RuffleCon 👸 https://www.facebook.com/RuffleCon 👗 https://www.facebook.com/groups/650859948310681/  '

  };
  db.Users.findOne({
    profileID: 'rufflecon'
  }, function(e, u) {
    kip.ohshit(e);
    if (!u) {
      u = new db.User(ruffleconUser)
      u.save(function(e) {
        kip.ohshit(e);
        ruffleconUser = u;
        getLandmark();
      })
    } else {
      _.merge(u, ruffleconUser);
      u.save(function(e) {
        console.log("updated user");
        kip.ohshit(e);
        ruffleconUser = u;
        getLandmark();
      })
    }
  })
}

var ruffleconLandmark;
function getLandmark() {
  console.log('getting landmark')
  ruffleconLandmark = {
    name: 'Ruffle Con',
    id: 'rufflecon',
    world: true,
    owner: {
      mongoId: ruffleconUser._id.toString(),
      profileID: ruffleconUser.profileID,
      name: ruffleconUser.name
    },
    valid: true,
    avatar: ruffleconUser.avatar,
    loc: {
      type: 'Point',
      coordinates: [-73.5323601, 41.054694]
    },
    description: 'A Northeast USA Alternative Fashion Conference held in Stamford, CT devoted to followers of cute, elegant alternative fashion. https://twitter.com/RuffleCon 👸 https://www.facebook.com/RuffleCon 👗 https://www.facebook.com/groups/650859948310681/  '

  };

  db.Landmarks.findOne({
    id: 'rufflecon',
    world: true
  }, function(e, l) {
    kip.ohshit(e);
    if (!l) {
      ruffleconLandmark = new db.Landmarks(ruffleconLandmark);
      ruffleconLandmark.save(function(e) {
        kip.ohshit(e);
        console.log(ruffleconLandmark);
        getHat();
      })
    } else {
      _.merge(l, ruffleconLandmark);
      l.save(function(e) {
        kip.ohshit(e);
        ruffleconLandmark = l;
        console.log(l);
        getHat();
      })
    }
  })

}

var ruffleconHat;
function getHat() {
  console.log('getting hat');
  ruffleconHat = {
    id: 'ruffleconhat',
    name: 'Rufflecon Prize Hat',
    world: false,
    parent: {
      mongoId: ruffleconLandmark._id.toString(),
      id: ruffleconLandmark.id,
      name: ruffleconLandmark.name
    },
    owner: {
      mongoId: ruffleconUser._id.toString(),
      profileID: ruffleconUser.profileID,
      name: ruffleconUser.name
    },
    valid: true,
    // avatar: 'https://s3.amazonaws.com/if.kip.apparel.images/rufflecon/rufflecon_avatar.png',
    loc: ruffleconLandmark.loc.toObject(),
    description: 'The Rufflecon contest hat!  A beautiful red hat, both soft and firm, with smooth yet well defined velvet curves.',
    price: 0,
    priceRange: 1,
    itemTags: {
      colors: ['Red'],
      categories: ['Hats'],
      text: ['hat', 'velvet']
    },
    itemImageURL: ['https://s3.amazonaws.com/if.kip.apparel.images/rufflecon/hat.png'],
    linkback: 'https://instagram.com/kipstyles.co',
    linkbackname: 'kipstyles.co'
  };
  console.log(ruffleconUser);
  db.Landmarks.findOne({
    world: false,
    id: 'ruffleconhat'
  }, function(e, hat) {
    kip.ohshit(e);
    if (!hat) {
      ruffleconHat = new db.Landmark(ruffleconHat);
      ruffleconHat.save(function(e) {
        kip.ohshit(e);
        console.log(ruffleconHat);
      })
    } else {
      _.merge(hat, ruffleconHat)
      hat.save(function(e) {
        kip.ohshit(e);
        ruffleconHat = hat;
        console.log(ruffleconHat);
      })
    }
  })
}


getUser();
