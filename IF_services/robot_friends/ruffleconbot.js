
// ROBOT FRIEND!!!!
var db = require('db');
var kip = require('kip');
var _ = require('lodash');
var request = require('request');
var config = require('config');
var ruffleconUser;
var jwt = require('jsonwebtoken');
var expiresInMinutes = 10 * 365 * 24 * 60; // 10 years

function getUser() {
  console.log('getting user');
  ruffleconUser = {
    profileID: 'rufflecon',
    name: 'RuffleCon',
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
    name: 'RuffleCon',
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
    name: 'RuffleCon Prize Hat',
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
    description: 'The RuffleCon contest hat!  A beautiful red hat, both soft and firm, with smooth yet well defined velvet curves.  From Japanese brand, Victorian Maiden',
    price: 0,
    priceRange: 1,
    itemTags: {
      colors: ['Red'],
      categories: ['Hats'],
      text: ['hat', 'velvet', 'Victorian Maiden']
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
        likeLooksWithHat();
      })
    } else {
      _.merge(hat, ruffleconHat)
      hat.save(function(e) {
        kip.ohshit(e);
        ruffleconHat = hat;
        console.log(ruffleconHat);
        likeLooksWithHat();
      })
    }
  })
}

/**
 * Creates a json web token for a user
 * @param user
 */
var getToken = function(user) {
    var jwtUser = {
        sub: user._id.toString(),
        name: user.name
    };

    return jwt.sign(jwtUser, config.auth.jwtSecret, {
        expiresInMinutes: expiresInMinutes
    });
};

function likeLooksWithHat() {
  db.Looks.find({
    snaps: {$elemMatch: {
      mongoId: ruffleconHat._id
    }},
    faves: {$not: {$elemMatch: {
      userId: ruffleconUser._id.toString()
    }}}
  }, function(e, items) {
    kip.ohshit(e);
    console.log('wooooooooooow i love these snaps 👒 💗 ');
    console.log('found', items.length, 'snaps to like');
    items.map(function(i) {
      request({
        url: config.app.publicAPI + '/looks/' + i._id.toString() + '/fave',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + getToken(ruffleconUser)
        }
      }, function(e, r, b) {
        if (e) { console.error(e) }
        console.log(b);
      })
    })

  })
}

function simpleGetStuff(done) {
  db.Users.findOne({
    profileID: 'rufflecon'
  }, function(e, u) {
    kip.ohshit(e);
    ruffleconUser = u;
    db.Landmarks.findOne({
      id: 'ruffleconhat'
    }, function(e, h) {
      kip.ohshit(e);
      ruffleconHat = h;
      db.Landmarks.findOne({
        id: 'rufflecon'
      }, function(e, l) {
        kip.ohshit(e);
        ruffleconLandmark = l;
        done();
      })
    })
  })

}

if (process.argv[2] === 'rebuild') {
  getUser();
} else {
  simpleGetStuff(likeLooksWithHat);
}