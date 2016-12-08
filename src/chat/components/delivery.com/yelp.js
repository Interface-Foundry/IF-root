var Yelp = require('node-yelp');
var oa = require('./yelp_const');

var yelp = Yelp.createClient({
  oauth: {
    "consumer_key": oa.consumer_key,
    "consumer_secret": oa.consumer_secret,
    "token": oa.token,
    "token_secret": oa.token_secret
  }
});

function tokenize (str) {
  return str.split(' ').join('+');
}

function matchLocation (restaurants, location) {
  //iterate through, etc
  console.log('matchLocation called on ' + location);
  //console.log(restaurants[0]);
  var closest = -1;
  var smallest = 40000
  for (var i = 0; i < restaurants.length; i++) {
    var distance = Math.sqrt(
      Math.pow(location.latitude - restaurants[i].location.coordinate.latitude, 2)
    + Math.pow(location.longitude - restaurants[i].location.coordinate.longitude, 2));

    if (distance < smallest) {
      smallest = distance;
      closest = i;
    }
  }

  console.log(location.latitude, location.longitude, '//', restaurants[closest].location.coordinate.latitude, restaurants[closest].location.coordinate.longitude)
  console.log(restaurants[closest].name)
}

function findRestaurant (merch) {

  //checkDB for thing
  //else search by name
  //and then search by location
  //and update the database

  yelp.search({
    term: tokenize(merch.summary.name),
    radius_filter: 40000,
    location: merch.location.city
  })
  .then(function (data) {
    //console.log('data?', data)
    var correctMerchant = matchLocation (
      data.businesses,
      {
        latitude: merch.location.latitude,
        longitude: merch.location.longitude
      }
    );
  })
  .catch(function (err) {
    console.log('ERROR:', err);
  })
}

module.exports = findRestaurant;
