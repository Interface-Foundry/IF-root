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

  //console.log(location.latitude, location.longitude, '//', restaurants[closest].location.coordinate.latitude, restaurants[closest].location.coordinate.longitude);
  //console.log(restaurants[closest].name);
  return restaurants[closest];
}

function yelpRestaurant (merch) {
  return yelp.search({
    term: tokenize(merch.summary.name),
    radius_filter: 40000,
    location: merch.location.city
  })
  .then(function (data) {
    return matchLocation (
      data.businesses,
      {
        latitude: merch.location.latitude,
        longitude: merch.location.longitude
      }
    )
  })
  .then (function (correctMerchant) {
    if (correctMerchant) return correctMerchant.url;
    else return merch.summary.url.complete
  })
  .catch(function (err) {
    console.log('ERROR:', err);
  })
}

module.exports = yelpRestaurant;
